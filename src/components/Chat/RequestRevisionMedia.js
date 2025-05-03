import React from 'react';
import { Paperclip, FileText, Download } from 'lucide-react';
import { getImage } from '~/Constant';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
const RequestRevisionMedia = ({ revisionFiles, onOpenFullView }) => {
    const getMediaType = (file) => {
        const ext = file.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg'].includes(ext)) return 'VIDEO';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'IMAGE';
        if (ext === 'pdf') return 'PDF';
        if (['doc', 'docx'].includes(ext)) return 'DOCX';
        return 'UNKNOWN';
    };

    const getFileCount = (files) => (Array.isArray(files) ? files.length : 0);

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        const addFileToZip = async (url, filename) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                zip.file(filename, blob);
            } catch (error) {
                console.error(`Failed to fetch ${filename}:`, error);
            }
        };

        const filePromises = revisionFiles.map((file) => {
            const url = getImage(file);
            const filename = file.split('/').pop(); // or a prettier name
            return addFileToZip(url, filename);
        });

        await Promise.all(filePromises);

        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'reference-materials.zip');
        });
    };

    if (!Array.isArray(revisionFiles) || revisionFiles.length === 0) {
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
                <div className="flex gap-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => onOpenFullView(0)}>
                        View All
                    </button>
                    <button
                        className="text-sm text-green-600 hover:text-green-800 flex items-center"
                        onClick={handleDownloadAll}
                    >
                        <Download size={16} className="mr-1" />
                        Download All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {revisionFiles.map((media, mediaIndex) => {
                    const type = getMediaType(media);
                    return (
                        <div
                            key={mediaIndex}
                            className="aspect-square bg-gray-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-300 transition duration-200"
                            onClick={() => onOpenFullView(mediaIndex)}
                        >
                            {type === 'IMAGE' && (
                                <img
                                    src={getImage(media)}
                                    alt="Revision"
                                    className="h-full w-full object-cover rounded-lg"
                                />
                            )}
                            {type === 'VIDEO' && (
                                <video
                                    src={getImage(media)}
                                    className="h-full w-full object-cover rounded-lg"
                                    muted
                                    loop
                                />
                            )}
                            {(type === 'PDF' || type === 'DOCX' || type === 'UNKNOWN') && (
                                <div className="flex flex-col items-center justify-center">
                                    <FileText size={32} className="text-gray-600" />
                                    <span className="text-xs mt-1 text-center px-1 break-words">
                                        {media.split('/').pop()}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default RequestRevisionMedia;
