"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import { Button, FileUpload } from '@/components/ui';
import { voiceAIService } from '@/service';
import { useTheme } from '@/contexts/ThemeContext';
import { useGlobalToast } from '@/contexts/ToastContext';

const AIProductExtract = ({ storeId, onExtractSuccess, onCancel }) => {
  const { currentVariant } = useTheme();
  const { showSuccess, showError } = useGlobalToast();
  const [selectedImages, setSelectedImages] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResults, setExtractionResults] = useState([]);
  const [currentExtractingIndex, setCurrentExtractingIndex] = useState(-1);
  const fileInputRef = useRef(null);

  // Handle image selection
  const handleImageSelect = (files) => {
    if (!files || files.length === 0) return;

    // Limit maximum images to prevent performance issues
    const MAX_IMAGES = 10;
    const currentCount = selectedImages.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      showError(`Maximum ${MAX_IMAGES} images allowed. Please remove some images first.`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      showError(`Only ${remainingSlots} more image(s) can be added. Maximum ${MAX_IMAGES} images allowed.`);
    }

    const newImages = filesToAdd.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      extractedData: null,
      error: null
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  // Remove image
  const handleRemoveImage = (imageId) => {
    setSelectedImages(prev => {
      const image = prev.find(img => img.id === imageId);
      if (image && image.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
    setExtractionResults(prev => prev.filter(result => result.imageId !== imageId));
  };

  // Extract product data from all images
  const handleExtractAll = async () => {
    if (selectedImages.length === 0) {
      showError('Please select at least one image');
      return;
    }

    setIsExtracting(true);
    const results = [];
    let mergedData = null;

    try {
      // Process each image sequentially
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        setCurrentExtractingIndex(i);

        // Update status to extracting
        setSelectedImages(prev =>
          prev.map(img =>
            img.id === image.id
              ? { ...img, status: 'extracting', error: null }
              : img
          )
        );

        try {
          // Call API to extract product data
          const result = await voiceAIService.extractProductFromImage(image.file);

          if (result.success && result.data) {
            const extractedData = result.data?.data || result.data?.payload || result.data;

            // Update image status
            setSelectedImages(prev =>
              prev.map(img =>
                img.id === image.id
                  ? { ...img, status: 'success', extractedData }
                  : img
              )
            );

            results.push({
              imageId: image.id,
              data: extractedData,
              success: true
            });

            // Merge data from all images (last image takes precedence for conflicts)
            if (!mergedData) {
              mergedData = { ...extractedData };
            } else {
              // Merge strategy: combine arrays, overwrite single values
              mergedData = {
                ...mergedData,
                ...extractedData,
                // Merge arrays (tags, features, specifications)
                content: mergedData.content || extractedData.content ? {
                  ...(mergedData.content || {}),
                  ...(extractedData.content || {}),
                  tags: [
                    ...(mergedData.content?.tags || []),
                    ...(extractedData.content?.tags || [])
                  ].filter((tag, index, self) => self.indexOf(tag) === index), // Remove duplicates
                  features: [
                    ...(mergedData.content?.features || []),
                    ...(extractedData.content?.features || [])
                  ].filter((feature, index, self) => self.indexOf(feature) === index), // Remove duplicates
                  specifications: [
                    ...(mergedData.content?.specifications || []),
                    ...(extractedData.content?.specifications || [])
                  ]
                } : null
              };
            }
          } else {
            // Handle error response
            const errorMessage = result.message || 'Failed to extract product data';
            setSelectedImages(prev =>
              prev.map(img =>
                img.id === image.id
                  ? { ...img, status: 'error', error: errorMessage }
                  : img
              )
            );

            results.push({
              imageId: image.id,
              success: false,
              error: errorMessage
            });
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to extract product data';
          setSelectedImages(prev =>
            prev.map(img =>
              img.id === image.id
                ? { ...img, status: 'error', error: errorMessage }
                : img
            )
          );

          results.push({
            imageId: image.id,
            success: false,
            error: errorMessage
          });
        }
      }

      setExtractionResults(results);

      // If we have merged data, call onExtractSuccess
      if (mergedData) {
        showSuccess(`Successfully extracted data from ${results.filter(r => r.success).length} image(s)`);
        if (onExtractSuccess) {
          onExtractSuccess(mergedData);
        }
      } else {
        showError('Failed to extract product data from any image');
      }
    } catch (error) {
      showError('An error occurred during extraction. Please try again.');
    } finally {
      setIsExtracting(false);
      setCurrentExtractingIndex(-1);
    }
  };

  // Cleanup preview URLs on unmount and when images change
  useEffect(() => {
    return () => {
      selectedImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [selectedImages]);

  const isDark = currentVariant === 'dark';

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-extract-title"
      aria-describedby="ai-extract-description"
    >
      <div className={`bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-[rgb(var(--color-border-primary))] ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
              <Sparkles className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 id="ai-extract-title" className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                AI Product Extraction
              </h2>
              <p id="ai-extract-description" className="text-sm text-[rgb(var(--color-text-secondary))]">
                Upload product images to automatically extract product information
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors ${isExtracting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isExtracting}
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image Upload Area */}
          <div className="mb-6">
            <FileUpload
              label="Upload Product Images"
              accept="image/*"
              multiple={true}
              onChange={handleImageSelect}
              disabled={isExtracting}
              helperText="Upload multiple images of your product. AI will extract product information from all images."
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          {/* Selected Images Grid */}
          {selectedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                Selected Images ({selectedImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative group border-2 rounded-lg overflow-hidden ${
                      image.status === 'extracting'
                        ? 'border-blue-500'
                        : image.status === 'success'
                        ? 'border-green-500'
                        : image.status === 'error'
                        ? 'border-red-500'
                        : 'border-[rgb(var(--color-border-primary))]'
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="aspect-square bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center">
                      <img
                        src={image.preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Status Overlay */}
                    {image.status === 'extracting' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      </div>
                    )}

                    {image.status === 'success' && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {image.status === 'error' && (
                      <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Remove Button */}
                    {!isExtracting && (
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}

                    {/* Error Message */}
                    {image.status === 'error' && image.error && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-xs p-2">
                        {image.error}
                      </div>
                    )}

                    {/* Image Number */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          {selectedImages.length === 0 && (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <strong>💡 Tip:</strong> Upload clear images of your product showing:
              </p>
              <ul className={`mt-2 space-y-1 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <li>• Product name and brand</li>
                <li>• Price tags (MRP, selling price)</li>
                <li>• Product specifications and features</li>
                <li>• Barcode or SKU (if visible)</li>
                <li>• GST information (if available)</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-[rgb(var(--color-border-primary))] ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
              {selectedImages.length > 0 && (
                <span>
                  {selectedImages.filter(img => img.status === 'success').length} of {selectedImages.length} images processed
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isExtracting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExtractAll}
                disabled={isExtracting || selectedImages.length === 0}
                loading={isExtracting}
                leftIcon={Sparkles}
              >
                {isExtracting ? 'Extracting...' : 'Extract Product Data'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProductExtract;

