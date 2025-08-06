import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, History, Image as ImageIcon, MessageSquare, Upload } from "lucide-react"
import Image from "next/image"
import { GenerationModel, AspectRatio, ImageSize, ModelType } from "@/types"
import { storage } from "@/lib/storage"

interface ControlPanelProps {
  isMobile: boolean
  isMobileMenuOpen: boolean
  isImageToImage: boolean
  sourceImages: string[]
  model: GenerationModel
  modelType: ModelType
  maskImage: string | null
  prompt: string
  size: ImageSize
  n: number
  quality: 'auto' | 'high' | 'medium' | 'low' | 'hd' | 'standard'
  aspectRatio: AspectRatio
  isGenerating: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onShowApiKeyDialog: () => void
  onShowHistoryDialog: () => void
  onShowCustomModelDialog: () => void
  onIsImageToImageChange: (value: boolean) => void
  onPromptChange: (value: string) => void
  onModelChange: (value: GenerationModel) => void
  onModelTypeChange: (value: ModelType) => void
  onSizeChange: (value: ImageSize) => void
  onNChange: (value: number) => void
  onQualityChange: (value: 'auto' | 'high' | 'medium' | 'low' | 'hd' | 'standard') => void
  onAspectRatioChange: (value: AspectRatio) => void
  onGenerate: () => void
  onReset: () => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
  onMaskEditorOpen: () => void
}

export function ControlPanel({
  isMobile,
  isMobileMenuOpen,
  isImageToImage,
  sourceImages,
  model,
  modelType,
  maskImage,
  prompt,
  size,
  n,
  quality,
  aspectRatio,
  isGenerating,
  fileInputRef,
  onShowApiKeyDialog,
  onShowHistoryDialog,
  onShowCustomModelDialog,
  onIsImageToImageChange,
  onPromptChange,
  onModelChange,
  onModelTypeChange,
  onSizeChange,
  onNChange,
  onQualityChange,
  onAspectRatioChange,
  onGenerate,
  onReset,
  onFileUpload,
  onRemoveImage,
  onMaskEditorOpen
}: ControlPanelProps) {
  return (
    <Card className={`${isMobile ? 'w-full' : 'sticky top-4'} ${isMobile && isMobileMenuOpen ? 'block' : isMobile ? 'hidden' : 'block'}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowApiKeyDialog}
          >
            <Settings className="h-4 w-4 mr-2" />
            {!isMobile && "密钥设置"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowHistoryDialog}
          >
            <History className="h-4 w-4 mr-2" />
            {!isMobile && "历史记录"}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">生成模式</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={isImageToImage ? "outline" : "secondary"} 
              className="w-full"
              onClick={() => onIsImageToImageChange(false)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {!isMobile && "文生图"}
            </Button>
            <Button 
              variant={isImageToImage ? "secondary" : "outline"}
              className="w-full"
              onClick={() => onIsImageToImageChange(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {!isMobile && "图生图"}
            </Button>
          </div>
        </div>

        {isImageToImage && (
          <div className="space-y-2">
            <h3 className="font-medium">上传图片进行编辑</h3>
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {sourceImages.length > 0 ? (
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                  {sourceImages.map((image, index) => (
                    <div key={index} className="relative aspect-square w-full">
                      <Image
                        src={image}
                        alt={`Source ${index + 1}`}
                        fill
                        className="object-contain rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveImage(index);
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  {sourceImages.length < 4 && (
                    <div className="flex items-center justify-center aspect-square w-full border-2 border-dashed rounded-lg">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="h-8 w-8" />
                  <p>点击上传图片或拖拽图片到这里</p>
                  <p className="text-xs">仅支持JPG、PNG格式，最大4MB</p>
                  <p className="text-xs text-blue-500">可上传多张图片作为参考（最多4张）</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={onFileUpload}
              multiple
            />
          </div>
        )}

        {isImageToImage && sourceImages.length > 0 && (model === 'dall-e-3' || model === 'gpt-image-1' || modelType === ModelType.DALLE) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onMaskEditorOpen}
          >
            {maskImage ? "重新编辑区域" : "编辑图片区域"}
          </Button>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">提示词</h3>
          <Textarea 
            placeholder="描述你想要生成的图像，例如：一只可爱的猫咪，柔软的毛发，大眼睛，阳光下微笑..."
            className="min-h-[120px]"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">模型选择</h3>
          <div className="flex gap-2 mb-2">
            <Select 
              value={model} 
              onValueChange={(value: GenerationModel) => {
                onModelChange(value)
                // 为内置模型设置对应的模型类型
                if (value === 'dall-e-3' || value === 'gpt-image-1') {
                  onModelTypeChange(ModelType.DALLE)
                } else {
                  onModelTypeChange(ModelType.OPENAI)
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择生成模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-image-1">GPT Image 1 模型</SelectItem>
                <SelectItem value="sora_image">GPT Sora_Image 模型</SelectItem>
                <SelectItem value="gpt_4o_image">GPT 4o_Image 模型</SelectItem>
                <SelectItem value="dall-e-3">DALL-E 3 模型</SelectItem>
                
                {/* 显示自定义模型 */}
                {storage.getCustomModels().length > 0 && (
                  <>
                    <SelectItem value="divider" disabled>
                      ──── 自定义模型 ────
                    </SelectItem>
                    {storage.getCustomModels().map(customModel => (
                      <SelectItem 
                        key={customModel.id} 
                        value={customModel.value}
                      >
                        {customModel.name} ({customModel.type === ModelType.DALLE ? "DALL-E" : "OpenAI"})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onShowCustomModelDialog}
              title="管理自定义模型"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">模型类型: {modelType === ModelType.DALLE ? 'DALL-E格式' : 'OpenAI格式'}</p>
          <p className="text-xs text-gray-500">选择不同的AI模型可能会产生不同风格的图像结果</p>
        </div>

        {(model === 'dall-e-3' || model === 'gpt-image-1' || modelType === ModelType.DALLE) && (
          <>
            <div className="space-y-2">
              <h3 className="font-medium">图片尺寸</h3>
              <Select value={size} onValueChange={(value: ImageSize) => onSizeChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择图片尺寸" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">1024x1024 方形</SelectItem>
                  <SelectItem value="1536x1024">1536x1024 横向</SelectItem>
                  <SelectItem value="1024x1536">1024x1536 纵向</SelectItem>
                  <SelectItem value="1792x1024">1792x1024 宽屏</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">生成数量</h3>
              <Select value={n.toString()} onValueChange={(value) => onNChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择生成数量" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1张</SelectItem>
                  <SelectItem value="2">2张</SelectItem>
                  <SelectItem value="3">3张</SelectItem>
                  <SelectItem value="4">4张</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isImageToImage && (
              <div className="space-y-2">
                <h3 className="font-medium">图片质量</h3>
                <Select 
                  value={quality} 
                  onValueChange={(value: 'auto' | 'high' | 'medium' | 'low' | 'hd' | 'standard') => onQualityChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择图片质量" />
                  </SelectTrigger>
                  <SelectContent>
                    {model === 'dall-e-3' ? (
                      <>
                        <SelectItem value="hd">HD 高质量</SelectItem>
                        <SelectItem value="standard">标准质量</SelectItem>
                        <SelectItem value="auto">自动选择</SelectItem>
                      </>
                    ) : model === 'gpt-image-1' ? (
                      <>
                        <SelectItem value="high">高质量</SelectItem>
                        <SelectItem value="medium">中等质量</SelectItem>
                        <SelectItem value="low">低质量</SelectItem>
                        <SelectItem value="auto">自动选择</SelectItem>
                      </>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {!(model === 'dall-e-3' || model === 'gpt-image-1' || modelType === ModelType.DALLE) && (
          <div className="space-y-2">
            <h3 className="font-medium">图片比例</h3>
            <Select value={aspectRatio} onValueChange={(value: AspectRatio) => onAspectRatioChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="选择图片比例" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 方形</SelectItem>
                <SelectItem value="16:9">16:9 宽屏</SelectItem>
                <SelectItem value="9:16">9:16 竖屏</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "生成中..." : isImageToImage ? "编辑图片" : "生成图片"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onReset}
        >
          重置
        </Button>
      </CardContent>
    </Card>
  )
} 