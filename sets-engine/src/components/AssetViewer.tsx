'use client'

import Image from 'next/image'

interface SampleAsset {
  id: string
  name: string
  imagePath: string
}

interface Props {
  asset: SampleAsset
  isLoading?: boolean
}

export function AssetViewer({ asset, isLoading }: Props) {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-muted">
      <Image
        src={asset.imagePath}
        alt={asset.name}
        width={600}
        height={400}
        className={`w-full object-contain transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        unoptimized
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <div className="text-center space-y-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm font-medium">Analyzing asset...</p>
          </div>
        </div>
      )}
    </div>
  )
}
