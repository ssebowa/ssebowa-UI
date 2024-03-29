import type { TFile } from 'librechat-data-provider';
import { useEffect, useRef, useState } from 'react';
import { useGetFiles } from '~/data-provider';

export default function SearchFileBubbleChat({
  chatText,
  onSelectFile,
}: {
  chatText: string;
  onSelectFile: (file: TFile, queryName: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fileQueryName, setFileQueryName] = useState<string>('');
  const [showSelectFile, setShowSelectFile] = useState<boolean>(false);

  const { data: searchFiles = [], refetch } = useGetFiles<TFile[]>({
    select: (files) => {
      if (fileQueryName === '') return files;
      return files.filter((file) =>
        file.filename.toLowerCase().startsWith(fileQueryName.toLowerCase()),
      );
    },
  });

  function handleSelectFile(file: TFile) {
    onSelectFile(file, `#${fileQueryName}`);
    setShowSelectFile(false);
  }

  useEffect(() => {
    const matchFileName = chatText.match(/^#$|^#([^\s][\w\s\-\.\,\!\@\$\%]*)$/);
    if (matchFileName) {
      if (searchFiles.length !== 0) refetch();
      setShowSelectFile(true);
      setFileQueryName(matchFileName[1] ?? '');
    } else {
      setShowSelectFile(false);
    }
  }, [chatText, refetch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSelectFile(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (!showSelectFile || searchFiles.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-750 py-3" ref={containerRef}>
      {searchFiles.map((file, index) => (
        <div
          key={index}
          onClick={() => handleSelectFile(file)}
          className="cursor-pointer py-2 hover:bg-gray-800"
        >
          <span className="px-4 text-white">{file.filename}</span>
        </div>
      ))}
    </div>
  );
}
