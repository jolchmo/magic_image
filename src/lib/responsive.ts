import { useState, useEffect } from 'react'

// 断点定义
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
} as const

// 屏幕尺寸类型
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large'

// 响应式状态接口
export interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLarge: boolean
  screenSize: ScreenSize
  width: number
  height: number
}

// 获取屏幕尺寸类型
export const getScreenSize = (width: number): ScreenSize => {
  if (width < breakpoints.mobile) return 'mobile'
  if (width < breakpoints.tablet) return 'tablet'
  if (width < breakpoints.desktop) return 'desktop'
  return 'large'
}

// 响应式Hook
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLarge: false,
        screenSize: 'desktop',
        width: 1024,
        height: 768,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const screenSize = getScreenSize(width)

    return {
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
      isDesktop: width >= breakpoints.tablet && width < breakpoints.desktop,
      isLarge: width >= breakpoints.desktop,
      screenSize,
      width,
      height,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const screenSize = getScreenSize(width)

      setState({
        isMobile: width < breakpoints.mobile,
        isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
        isDesktop: width >= breakpoints.tablet && width < breakpoints.desktop,
        isLarge: width >= breakpoints.desktop,
        screenSize,
        width,
        height,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return state
}

// 响应式类名生成器
export const getResponsiveClasses = (responsive: ResponsiveState) => {
  const classes = []

  if (responsive.isMobile) {
    classes.push('mobile-layout')
  } else if (responsive.isTablet) {
    classes.push('tablet-layout')
  } else if (responsive.isDesktop) {
    classes.push('desktop-layout')
  } else {
    classes.push('large-screen-layout')
  }

  return classes.join(' ')
}

// 响应式间距类名
export const getSpacingClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'p-4 space-y-4'
  } else if (responsive.isTablet) {
    return 'p-6 space-y-6'
  } else {
    return 'p-8 space-y-8'
  }
}

// 响应式文本类名
export const getTextClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'text-sm'
  } else if (responsive.isTablet) {
    return 'text-base'
  } else {
    return 'text-lg'
  }
}

// 响应式按钮类名
export const getButtonClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'touch-optimized'
  
  if (responsive.isMobile) {
    return `${baseClasses} min-h-[44px] text-sm px-4 py-3`
  } else if (responsive.isTablet) {
    return `${baseClasses} min-h-[40px] text-sm px-6 py-2`
  } else {
    return `${baseClasses} min-h-[36px] text-base px-8 py-2`
  }
}

// 响应式卡片类名
export const getCardClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-card'
  
  if (responsive.isMobile) {
    return `${baseClasses} p-4 mb-4`
  } else if (responsive.isTablet) {
    return `${baseClasses} p-6 mb-6`
  } else {
    return `${baseClasses} p-8 mb-8`
  }
}

// 响应式网格类名
export const getGridClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'grid-cols-1 gap-4'
  } else if (responsive.isTablet) {
    return 'grid-cols-[280px_1fr] gap-6'
  } else {
    return 'grid-cols-[320px_1fr] gap-8'
  }
}

// 响应式容器类名
export const getContainerClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'px-4 max-w-full'
  } else if (responsive.isTablet) {
    return 'px-6 max-w-6xl'
  } else {
    return 'px-8 max-w-7xl'
  }
}

// 响应式图片类名
export const getImageClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-image'
  
  if (responsive.isMobile) {
    return `${baseClasses} max-w-full`
  } else if (responsive.isTablet) {
    return `${baseClasses} max-w-2xl`
  } else {
    return `${baseClasses} max-w-4xl`
  }
}

// 响应式表单类名
export const getFormClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-form'
  
  if (responsive.isMobile) {
    return `${baseClasses} space-y-4`
  } else if (responsive.isTablet) {
    return `${baseClasses} space-y-6`
  } else {
    return `${baseClasses} space-y-8`
  }
}

// 响应式导航类名
export const getNavClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-nav'
  
  if (responsive.isMobile) {
    return `${baseClasses} flex-col space-y-2`
  } else {
    return `${baseClasses} flex-row space-x-4`
  }
}

// 响应式工具栏类名
export const getToolbarClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-toolbar'
  
  if (responsive.isMobile) {
    return `${baseClasses} flex-col space-y-2`
  } else {
    return `${baseClasses} flex-row space-x-2`
  }
}

// 响应式模态框类名
export const getModalClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-modal'
  
  if (responsive.isMobile) {
    return `${baseClasses} w-[95vw] h-[95vh]`
  } else if (responsive.isTablet) {
    return `${baseClasses} w-[90vw] h-[90vh]`
  } else {
    return `${baseClasses} w-[80vw] h-[80vh]`
  }
}

// 响应式状态指示器类名
export const getStatusClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-status'
  
  if (responsive.isMobile) {
    return `${baseClasses} flex-col text-center p-3`
  } else {
    return `${baseClasses} flex-row p-4`
  }
}

// 响应式加载动画类名
export const getLoadingClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-loading'
  
  if (responsive.isMobile) {
    return `${baseClasses} p-4`
  } else {
    return `${baseClasses} p-8`
  }
}

// 响应式错误提示类名
export const getErrorClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-error'
  
  if (responsive.isMobile) {
    return `${baseClasses} p-3 text-sm`
  } else {
    return `${baseClasses} p-4 text-base`
  }
}

// 响应式成功提示类名
export const getSuccessClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'responsive-success'
  
  if (responsive.isMobile) {
    return `${baseClasses} p-3 text-sm`
  } else {
    return `${baseClasses} p-4 text-base`
  }
}

// 响应式滚动类名
export const getScrollClasses = (responsive: ResponsiveState) => {
  return 'mobile-scroll'
}

// 响应式触摸优化类名
export const getTouchClasses = (responsive: ResponsiveState) => {
  return 'touch-optimized'
}

// 响应式输入框类名
export const getInputClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'mobile-input'
  
  if (responsive.isMobile) {
    return `${baseClasses} text-base`
  } else {
    return `${baseClasses} text-sm`
  }
}

// 响应式选择框类名
export const getSelectClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'touch-optimized'
  
  if (responsive.isMobile) {
    return `${baseClasses} min-h-[44px] text-base`
  } else {
    return `${baseClasses} min-h-[36px] text-sm`
  }
}

// 响应式文本区域类名
export const getTextareaClasses = (responsive: ResponsiveState) => {
  const baseClasses = 'mobile-input'
  
  if (responsive.isMobile) {
    return `${baseClasses} text-base min-h-[120px]`
  } else {
    return `${baseClasses} text-sm min-h-[100px]`
  }
}

// 响应式标签类名
export const getLabelClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'text-sm font-medium mb-2'
  } else {
    return 'text-base font-medium mb-3'
  }
}

// 响应式标题类名
export const getTitleClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'text-xl font-bold'
  } else if (responsive.isTablet) {
    return 'text-2xl font-bold'
  } else {
    return 'text-3xl font-bold'
  }
}

// 响应式副标题类名
export const getSubtitleClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'text-sm text-gray-600'
  } else {
    return 'text-base text-gray-600'
  }
}

// 响应式描述类名
export const getDescriptionClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'text-xs text-gray-500'
  } else {
    return 'text-sm text-gray-500'
  }
}

// 响应式图标类名
export const getIconClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'h-5 w-5'
  } else {
    return 'h-4 w-4'
  }
}

// 响应式间距类名
export const getMarginClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'm-2'
  } else if (responsive.isTablet) {
    return 'm-4'
  } else {
    return 'm-6'
  }
}

// 响应式内边距类名
export const getPaddingClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'p-3'
  } else if (responsive.isTablet) {
    return 'p-4'
  } else {
    return 'p-6'
  }
}

// 响应式圆角类名
export const getRadiusClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'rounded-md'
  } else {
    return 'rounded-lg'
  }
}

// 响应式阴影类名
export const getShadowClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'shadow-sm'
  } else {
    return 'shadow-md'
  }
}

// 响应式边框类名
export const getBorderClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'border border-gray-200'
  } else {
    return 'border-2 border-gray-200'
  }
}

// 响应式背景类名
export const getBackgroundClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'bg-white'
  } else {
    return 'bg-gray-50'
  }
}

// 响应式透明度类名
export const getOpacityClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'opacity-90'
  } else {
    return 'opacity-100'
  }
}

// 响应式变换类名
export const getTransformClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'scale-95'
  } else {
    return 'scale-100'
  }
}

// 响应式过渡类名
export const getTransitionClasses = (responsive: ResponsiveState) => {
  return 'transition-all duration-200 ease-in-out'
}

// 响应式动画类名
export const getAnimationClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'animate-pulse'
  } else {
    return 'animate-bounce'
  }
}

// 响应式焦点类名
export const getFocusClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
  } else {
    return 'focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
  }
}

// 响应式悬停类名
export const getHoverClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'active:scale-95'
  } else {
    return 'hover:scale-105'
  }
}

// 响应式激活类名
export const getActiveClasses = (responsive: ResponsiveState) => {
  if (responsive.isMobile) {
    return 'active:bg-gray-100'
  } else {
    return 'hover:bg-gray-100'
  }
}

// 响应式禁用类名
export const getDisabledClasses = (responsive: ResponsiveState) => {
  return 'opacity-50 cursor-not-allowed'
}

// 响应式加载类名
export const getLoadingStateClasses = (responsive: ResponsiveState) => {
  return 'animate-spin'
}

// 响应式错误状态类名
export const getErrorStateClasses = (responsive: ResponsiveState) => {
  return 'border-red-500 bg-red-50'
}

// 响应式成功状态类名
export const getSuccessStateClasses = (responsive: ResponsiveState) => {
  return 'border-green-500 bg-green-50'
}

// 响应式警告状态类名
export const getWarningStateClasses = (responsive: ResponsiveState) => {
  return 'border-yellow-500 bg-yellow-50'
}

// 响应式信息状态类名
export const getInfoStateClasses = (responsive: ResponsiveState) => {
  return 'border-blue-500 bg-blue-50'
}

// 响应式主要状态类名
export const getPrimaryStateClasses = (responsive: ResponsiveState) => {
  return 'border-blue-500 bg-blue-50'
}

// 响应式次要状态类名
export const getSecondaryStateClasses = (responsive: ResponsiveState) => {
  return 'border-gray-500 bg-gray-50'
}

// 响应式中性状态类名
export const getNeutralStateClasses = (responsive: ResponsiveState) => {
  return 'border-gray-300 bg-gray-50'
}

// 响应式强调状态类名
export const getAccentStateClasses = (responsive: ResponsiveState) => {
  return 'border-purple-500 bg-purple-50'
}

// 响应式危险状态类名
export const getDangerStateClasses = (responsive: ResponsiveState) => {
  return 'border-red-500 bg-red-50'
}

// 响应式成功状态类名
export const getSuccessStateClasses = (responsive: ResponsiveState) => {
  return 'border-green-500 bg-green-50'
}

// 响应式警告状态类名
export const getWarningStateClasses = (responsive: ResponsiveState) => {
  return 'border-yellow-500 bg-yellow-50'
}

// 响应式信息状态类名
export const getInfoStateClasses = (responsive: ResponsiveState) => {
  return 'border-blue-500 bg-blue-50'
}

// 响应式主要状态类名
export const getPrimaryStateClasses = (responsive: ResponsiveState) => {
  return 'border-blue-500 bg-blue-50'
}

// 响应式次要状态类名
export const getSecondaryStateClasses = (responsive: ResponsiveState) => {
  return 'border-gray-500 bg-gray-50'
}

// 响应式中性状态类名
export const getNeutralStateClasses = (responsive: ResponsiveState) => {
  return 'border-gray-300 bg-gray-50'
}

// 响应式强调状态类名
export const getAccentStateClasses = (responsive: ResponsiveState) => {
  return 'border-purple-500 bg-purple-50'
}

// 响应式危险状态类名
export const getDangerStateClasses = (responsive: ResponsiveState) => {
  return 'border-red-500 bg-red-50'
} 