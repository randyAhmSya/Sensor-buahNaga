import { useEffect } from 'react'

export interface PageMetaOptions {
  title: string
  description?: string
}

export function usePageMeta({ title, description }: PageMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let metaDesc = document.querySelector('meta[name="description"]')
    let previousDesc: string | null = null

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      } else {
        previousDesc = metaDesc.getAttribute('content')
      }
      metaDesc.setAttribute('content', description)
    }

    return () => {
      document.title = previousTitle
      if (description && metaDesc) {
        if (previousDesc !== null) {
          metaDesc.setAttribute('content', previousDesc)
        } else {
          metaDesc.removeAttribute('content')
        }
      }
    }
  }, [title, description])
}

