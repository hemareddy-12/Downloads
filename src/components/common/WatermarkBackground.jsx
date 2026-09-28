import React from 'react';
import { useBrand } from '../../context/BrandContext';

export const WatermarkBackground = () => {
  const { brandSettings } = useBrand();
  const { watermarkSettings = {}, logoUrl, bgLogoUrl, brandName } = brandSettings || {};

  if (!watermarkSettings?.enabled) {
    return null;
  }

  const logoSrc = bgLogoUrl || logoUrl;
  const opacity = watermarkSettings.opacity ?? 0.05;
  const size = watermarkSettings.size ?? 480;
  const position = watermarkSettings.position ?? 'center';
  const isFixed = watermarkSettings.fixed !== false;

  const positionClasses = {
    'center': 'items-center justify-center top-0 left-0 w-full h-full',
    'top-right': 'items-start justify-end top-12 right-12',
    'bottom-right': 'items-end justify-end bottom-12 right-12',
    'repeat': 'top-0 left-0 w-full h-full',
  }[position] || 'items-center justify-center top-0 left-0 w-full h-full';

  return (
    <div
      className={`watermark-container pointer-events-none select-none z-0 overflow-hidden ${
        isFixed ? 'fixed' : 'absolute'
      } inset-0 flex ${positionClasses}`}
      aria-hidden="true"
      style={{
        opacity: opacity,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {position === 'repeat' ? (
        <div
          className="w-full h-full opacity-100 flex flex-wrap gap-24 p-12 justify-around items-center"
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center m-8 transform -rotate-12">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt=""
                  className="object-contain"
                  style={{ width: `${size * 0.4}px`, height: 'auto', maxHeight: `${size * 0.4}px` }}
                />
              ) : (
                <span className="font-serif tracking-widest uppercase text-charcoal-900 text-2xl font-light">
                  {brandName || 'hemareddy'}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex items-center justify-center p-8 transform transition-transform"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              className="object-contain transition-all"
              style={{
                width: `${size}px`,
                maxWidth: '85vw',
                height: 'auto',
                maxHeight: '85vh',
              }}
            />
          ) : (
            <div className="text-center transform -rotate-6">
              <span className="font-serif tracking-widest text-4xl sm:text-6xl md:text-7xl font-light text-charcoal-900 uppercase block">
                {brandName || 'hemareddy'}
              </span>
              {brandSettings?.tagline ? (
                <span className="text-xs uppercase tracking-widest text-gold-600 block mt-4 font-sans font-medium">
                  {brandSettings.tagline}
                </span>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
