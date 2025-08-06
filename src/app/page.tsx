"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Download, Edit, Settings, History, Image as ImageIcon, MessageSquare, Upload, ChevronLeft, ChevronRight, Maximize2, Github, Menu, X } from "lucide-react"
import Image from "next/image"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { HistoryDialog } from "@/components/history-dialog"
import { ControlPanel } from "@/components/control-panel"
import { useState, useRef, useEffect, Suspense, useCallback } from "react"
import { api } from "@/lib/api"
import { GenerationModel, AspectRatio, ImageSize, DalleImageData, ModelType } from "@/types"
import { storage } from "@/lib/storage"
import { v4 as uuidv4 } from 'uuid'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MaskEditor } from "@/components/mask-editor"
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CustomModelDialog } from "@/components/custom-model-dialog"
import { toast } from "sonner"

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showCustomModelDialog, setShowCustomModelDialog] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState<GenerationModel>("gpt-image-1")
  const [modelType, setModelType] = useState<ModelType>(ModelType.OPENAI)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamContent, setStreamContent] = useState<string>("")
  const [isImageToImage, setIsImageToImage] = useState(false)
  const [sourceImages, setSourceImages] = useState<string[]>([])
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const [size, setSize] = useState<ImageSize>("1024x1024")
  const [n, setN] = useState(1)
  const [quality, setQuality] = useState<'auto' | 'high' | 'medium' | 'low' | 'hd' | 'standard'>('auto')
  const contentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showMaskEditor, setShowMaskEditor] = useState(false)
  const [maskImage, setMaskImage] = useState<string | null>(null)
  const [isMaskEditorOpen, setIsMaskEditorOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const searchParams = useSearchParams()

  // 响应式状态管理
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // 监听屏幕尺寸变化
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    const url = searchParams.get('url')
    const apiKey = searchParams.get('apikey')
    
    if (url && apiKey) {
      // 解码 URL 参数
      const decodedUrl = decodeURIComponent(url)
      const decodedApiKey = decodeURIComponent(apiKey)
      storage.setApiConfig(decodedApiKey, decodedUrl)
    }

    // 检查并修复存储的API URL，确保使用HTTPS
    const storedConfig = storage.getApiConfig()
    if (storedConfig && storedConfig.baseUrl && storedConfig.baseUrl.startsWith('http:')) {
      const secureUrl = storedConfig.baseUrl.replace('http:', 'https:')
      storage.setApiConfig(storedConfig.key, secureUrl)
      console.log('API URL已自动升级到HTTPS:', secureUrl)
    }
  }, [searchParams])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          setError("图片大小不能超过10MB")
          return
        }

        // 检查文件类型
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          setError("只支持JPG和PNG格式的图片")
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          setSourceImages(prev => [...prev, base64])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setSourceImages(prev => prev.filter((_, i) => i !== index))
    // 重置文件输入框的值，确保相同的文件可以再次上传
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isBase64Image = (url: string) => {
    return url.startsWith('data:image');
  }

  const handleSelectCustomModel = (modelValue: string, type: ModelType) => {
    setModel(modelValue)
    setModelType(type)
    toast.success("已选择自定义模型")
  }

  const handleGenerate = async () => {
    if (isImageToImage && sourceImages.length === 0) {
      setError("请先上传或选择图片")
      return
    }
    if (!prompt.trim()) {
      setError("请输入提示词")
      return
    }

    setError(null)
    setIsGenerating(true)
    setGeneratedImages([])
    setStreamContent("")
    setCurrentImageIndex(0)

    try {
      const isDalleModel = model === 'dall-e-3' || model === 'gpt-image-1' || modelType === ModelType.DALLE
      
      // 如果有多张源图片，将它们的信息添加到提示词中
      let enhancedPrompt = prompt.trim();
      if (sourceImages.length > 1) {
        enhancedPrompt += `\n\n参考图片信息：上传了${sourceImages.length}张参考图片，第一张作为主要参考，其他图片作为额外参考。`;
      }
      
      const finalPrompt = isDalleModel ? enhancedPrompt : `${enhancedPrompt}\n图片生成比例为：${aspectRatio}`
      
      if (isDalleModel) {
        if (isImageToImage) {
          if (sourceImages.length === 0) {
            throw new Error('请先上传图片')
          }
          
          try {
            // DALL-E API仅支持使用第一张图片进行编辑
            // 注意: 对于generateStreamImage方法，我们已添加对多图片的支持
            const response = await api.editDalleImage({
              prompt: finalPrompt,
              model,
              modelType,
              sourceImage: sourceImages[0],
              size,
              n,
              mask: maskImage || undefined,
              quality
            })
            
            const imageUrls = response.data.map(item => {
              // 处理DALL-E返回的URL或base64图片
              const imageUrl = item.url || item.b64_json;
              // 如果是base64格式，添加data:image前缀(如果还没有)
              if (imageUrl && item.b64_json && !isBase64Image(imageUrl)) {
                return `data:image/png;base64,${imageUrl}`;
              }
              return imageUrl || ''; // 添加空字符串作为默认值
            }).filter(url => url !== ''); // 过滤掉空链接
            
            setGeneratedImages(imageUrls)
            
            if (imageUrls.length > 0) {
              storage.addToHistory({
                id: uuidv4(),
                prompt: finalPrompt,
                url: imageUrls[0],
                model,
                createdAt: new Date().toISOString(),
                aspectRatio: '1:1'
              })
            }
          } catch (err) {
            if (err instanceof Error) {
              setError(err.message)
            } else {
              setError('生成图片失败，请重试')
            }
          }
        } else {
          try {
            const response = await api.generateDalleImage({
              prompt: finalPrompt,
              model,
              size,
              n,
              quality
            })
            
            const imageUrls = response.data.map(item => {
              // 处理DALL-E返回的URL或base64图片
              const imageUrl = item.url || item.b64_json;
              // 如果是base64格式，添加data:image前缀(如果还没有)
              if (imageUrl && item.b64_json && !isBase64Image(imageUrl)) {
                return `data:image/png;base64,${imageUrl}`;
              }
              return imageUrl || ''; // 添加空字符串作为默认值
            }).filter(url => url !== ''); // 过滤掉空链接
            
            setGeneratedImages(imageUrls)
            
            if (imageUrls.length > 0) {
              storage.addToHistory({
                id: uuidv4(),
                prompt: finalPrompt,
                url: imageUrls[0],
                model,
                createdAt: new Date().toISOString(),
                aspectRatio: '1:1'
              })
            }
          } catch (err) {
            if (err instanceof Error) {
              setError(err.message)
            } else {
              setError('生成图片失败，请重试')
            }
          }
        }
      } else {
        await api.generateStreamImage(
          {
            prompt: finalPrompt,
            model,
            modelType,
            sourceImage: isImageToImage && sourceImages.length > 0 ? sourceImages[0] : undefined,
            sourceImages: isImageToImage ? sourceImages : undefined,
            isImageToImage,
            aspectRatio
          },
          {
            onMessage: (content) => {
              setStreamContent(prev => prev + content)
              if (contentRef.current) {
                contentRef.current.scrollTop = contentRef.current.scrollHeight
              }
            },
            onComplete: (imageUrl) => {
              setGeneratedImages([imageUrl])
              storage.addToHistory({
                id: uuidv4(),
                prompt: finalPrompt,
                url: imageUrl,
                model,
                createdAt: new Date().toISOString(),
                aspectRatio
              })
            },
            onError: (error) => {
              // 处理流式 API 错误
              if (typeof error === 'object' && error !== null) {
                const apiError = error as any
                setError(`图片生成失败: ${apiError.message || '未知错误'}\n${apiError.code ? `错误代码: ${apiError.code}` : ''}`)
              } else {
                setError(error.toString())
              }
            }
          }
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setPrompt("")
    setGeneratedImages([])
    setError(null)
    setStreamContent("")
    setSourceImages([])
    setMaskImage(null)
    setAspectRatio("1:1")
    setSize("1024x1024")
    setN(1)
    setCurrentImageIndex(0)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + generatedImages.length) % generatedImages.length)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % generatedImages.length)
  }

  const handleEditCurrentImage = () => {
    if (generatedImages[currentImageIndex]) {
      setIsImageToImage(true)
      setSourceImages([generatedImages[currentImageIndex]])
    }
  }

  const handleDownload = () => {
    if (generatedImages[currentImageIndex]) {
      const imageUrl = generatedImages[currentImageIndex];
      const link = document.createElement('a');
      link.href = imageUrl;
      
      // 为base64图片设置合适的文件名
      if (isBase64Image(imageUrl)) {
        link.download = `generated-image-${Date.now()}.png`;
      } else {
        link.download = 'generated-image.png';
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 使用独立的控制面板组件
  const handleMaskEditorOpen = useCallback(() => {
    setIsMaskEditorOpen(true)
    setSelectedImage(sourceImages[0])
  }, [sourceImages, setIsMaskEditorOpen, setSelectedImage])

  return (
    <main className="min-h-screen bg-background">
      {/* 顶部提示栏 */}
      <div className="w-full bg-blue-50 p-4 relative">
        <div className="container mx-auto flex justify-center text-sm text-blue-700">
          <Info className="h-4 w-4 mr-2" />
          <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
            数据安全提示：所有生成的图片和历史记录仅保存在本地浏览器中。请及时下载并备份重要图片。使用隐私模式或更换设备会导致数据丢失无法恢复。
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
          onClick={() => window.open('https://github.com/jolchmo/magic_image', '_blank')}
        >
          <Github className="h-5 w-5" />
        </Button>
      </div>

      {/* 标题区域 */}
      <div className="text-center py-8">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>魔法AI绘画</h1>
        <p className="text-gray-500 mt-2">通过简单的文字描述，创造精美的AI艺术作品</p>
      </div>

      {/* 移动端菜单按钮 */}
      {isMobile && (
        <div className="container mx-auto px-4 mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <>
                <X className="h-4 w-4 mr-2" />
                隐藏控制面板
              </>
            ) : (
              <>
                <Menu className="h-4 w-4 mr-2" />
                显示控制面板
              </>
            )}
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8 max-w-[1200px]">
        {/* 响应式布局 */}
        <div className={`${
          isMobile 
            ? 'flex flex-col gap-4' 
            : isTablet 
              ? 'grid grid-cols-[280px_1fr] gap-4' 
              : 'grid grid-cols-[320px_1fr] gap-6'
        }`}>
          {/* 左侧控制面板 */}
          <div className={`${isMobile ? 'w-full' : ''}`}>
            <ControlPanel
              isMobile={isMobile}
              isMobileMenuOpen={isMobileMenuOpen}
              isImageToImage={isImageToImage}
              sourceImages={sourceImages}
              model={model}
              modelType={modelType}
              maskImage={maskImage}
              prompt={prompt}
              size={size}
              n={n}
              quality={quality}
              aspectRatio={aspectRatio}
              isGenerating={isGenerating}
              fileInputRef={fileInputRef}
              onShowApiKeyDialog={() => setShowApiKeyDialog(true)}
              onShowHistoryDialog={() => setShowHistoryDialog(true)}
              onShowCustomModelDialog={() => setShowCustomModelDialog(true)}
              onIsImageToImageChange={setIsImageToImage}
              onPromptChange={setPrompt}
              onModelChange={setModel}
              onModelTypeChange={setModelType}
              onSizeChange={setSize}
              onNChange={setN}
              onQualityChange={setQuality}
              onAspectRatioChange={setAspectRatio}
              onGenerate={handleGenerate}
              onReset={handleReset}
              onFileUpload={handleFileUpload}
              onRemoveImage={handleRemoveImage}
              onMaskEditorOpen={handleMaskEditorOpen}
            />
          </div>

          {/* 右侧内容区 */}
          <Card className={`${isMobile ? 'w-full' : ''} min-h-[calc(100vh-13rem)]`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>生成结果</h2>
                {generatedImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={handleDownload}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => {
                        setIsImageToImage(true)
                        setSourceImages([generatedImages[currentImageIndex]])
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch justify-start p-6 h-full">
              {error ? (
                <div className="text-center text-red-500 whitespace-pre-line">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col gap-4">
                  {(model === 'dall-e-3' || model === 'gpt-image-1' || modelType === ModelType.DALLE) ? (
                    <div className="text-center text-gray-400">
                      {isGenerating ? "正在生成中..." : generatedImages.length === 0 ? "等待生成..." : null}
                    </div>
                  ) : (
                    <div 
                      ref={contentRef}
                      className="flex-1 overflow-y-auto rounded-lg bg-gray-50 p-4 font-mono text-sm min-h-[200px] markdown-content"
                    >
                      {streamContent ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            // 自定义链接在新窗口打开
                            a: ({ node, ...props }) => (
                              <a target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                            // 自定义代码块样式
                            code: ({ node, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '')
                              // 内联代码与代码块处理
                              const isInline = !match && !className
                              if (isInline) {
                                return <code className={className} {...props}>{children}</code>
                              }
                              // 代码块
                              return (
                                <pre className={`${className || ''}`}>
                                  <code className={match ? `language-${match[1]}` : ''} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              )
                            }
                          }}
                        >
                          {streamContent}
                        </ReactMarkdown>
                      ) : (
                        <div className="text-gray-400 text-center">
                          {isGenerating ? "正在生成中..." : "等待生成..."}
                        </div>
                      )}
                    </div>
                  )}
                  {generatedImages.length > 0 && (
                    <div className={`relative w-full aspect-square ${isMobile ? 'max-w-full' : 'max-w-2xl'} mx-auto`}>
                      <Image
                        src={generatedImages[currentImageIndex]}
                        alt={prompt}
                        fill
                        className="object-contain rounded-lg"
                      />
                      {generatedImages.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80"
                            onClick={handlePrevImage}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80"
                            onClick={handleNextImage}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/50 px-2 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {generatedImages.length}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ApiKeyDialog 
        open={showApiKeyDialog} 
        onOpenChange={setShowApiKeyDialog} 
      />
      <HistoryDialog 
        open={showHistoryDialog} 
        onOpenChange={setShowHistoryDialog}
        onEditImage={(imageUrl) => {
          setIsImageToImage(true)
          setSourceImages([imageUrl])
        }}
      />
      <CustomModelDialog
        open={showCustomModelDialog}
        onOpenChange={setShowCustomModelDialog}
        onSelectModel={handleSelectCustomModel}
      />

      <footer className="w-full py-4 text-center text-sm text-gray-500">
        <a 
          href="https://github.com/HappyDongD/magic_image" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          <Github className="h-4 w-4" />
          访问 GitHub 项目主页
        </a>
      </footer>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <div className="relative w-full aspect-square">
            <Image
              src={generatedImages[currentImageIndex]}
              alt={prompt}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {isMaskEditorOpen && selectedImage ? (
        <MaskEditor
          imageUrl={selectedImage}
          onMaskChange={(maskDataUrl) => {
            setMaskImage(maskDataUrl)
            setIsMaskEditorOpen(false)
          }}
          onClose={() => setIsMaskEditorOpen(false)}
          initialMask={maskImage || undefined}
        />
      ) : null}
    </main>
  )
}
