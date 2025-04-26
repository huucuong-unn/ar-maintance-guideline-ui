import React from 'react';
import { Paperclip } from 'lucide-react';
import { getImage } from '~/Constant';

const RequestRevisionMedia = ({ revisionFiles, onOpenFullView }) => {
    // Helper function to get media type
    const getMediaType = (file) => {
        const fileExtension = file.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
            return 'VIDEO';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return 'IMAGE';
        }
        return 'UNKNOWN';
    };

    // Helper function to get file count
    const getFileCount = (files) => {
        if (!files) return 0;
        return Array.isArray(files) ? files.length : 0;
    };

    // If no files, render empty state
    if (!revisionFiles || !Array.isArray(revisionFiles) || revisionFiles.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                    <Paperclip size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No reference materials available</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-2 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 flex items-center">
                    <Paperclip size={16} className="mr-1" />
                    Reference Materials ({getFileCount(revisionFiles)})
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => onOpenFullView(0)}>
                    View All
                </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {revisionFiles.map((media, mediaIndex) => (
                    <div
                        key={mediaIndex}
                        className="aspect-square bg-gray-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-300 transition duration-200"
                        onClick={() => onOpenFullView(mediaIndex)}
                    >
                        <div className="flex flex-col items-center justify-center">
                            {getMediaType(media) === 'IMAGE' && (
                                <img
                                    src={getImage(media)}
                                    alt="Revision Thumbnail"
                                    className="h-full w-full object-cover rounded-lg"
                                />
                            )}
                            {getMediaType(media) === 'VIDEO' && (
                                <video
                                    src={getImage(media)}
                                    className="h-full w-full object-cover rounded-lg"
                                    muted
                                    loop
                                />
                            )}
                            <span className="text-xs text-gray-500 mt-1">{mediaIndex + 1}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default RequestRevisionMedia;
