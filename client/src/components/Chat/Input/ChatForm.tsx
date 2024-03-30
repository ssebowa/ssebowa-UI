import { useRecoilState } from 'recoil';
import { useContext, type ChangeEvent, useEffect } from 'react';
import { useChatContext } from '~/Providers';
import { useRequiresKey } from '~/hooks';
import AttachFile from './Files/AttachFile';
import StopButton from './StopButton';
import SendButton from './SendButton';
import FileRow from './Files/FileRow';
import Textarea from './Textarea';
import store from '~/store';
import axios from 'axios';
import { ChatDataContext } from '~/App';
import { ExtendedFile } from '~/common';
import type { TFile } from 'librechat-data-provider';
import SearchFileBubbleChat from '~/components/Chat/Input/SearchFileBubbleChat';

export default function ChatForm({ index = 0 }) {
  const [text, setText] = useRecoilState(store.textByIndex(index));
  const [showStopButton, setShowStopButton] = useRecoilState(store.showStopButtonByIndex(index));

  const {
    // ask,
    files,
    setFiles,
    conversation,
    isSubmitting,
    handleStopGenerating,
    filesLoading,
    setFilesLoading,
  } = useChatContext();

  const { submitChatMessage, ssebowaData } = useContext(ChatDataContext);
  const sendMessage = async () => {
    // ask({ text });
    submitChatMessage({ text: text, files: files });
    setText('');
    setFiles(new Map());
  };

  const { requiresKey } = useRequiresKey();
  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: '' };
  const endpoint = endpointType ?? _endpoint;

  async function handleSelectedFile(file: TFile) {
    const imgUrl =
      file.source === 'local' ? `${window.location.origin}${file.filepath}` : file.filepath;
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    const fileBlob = new File([blob], file.filename, { type: file.type });

    const extendedFile: ExtendedFile = {
      _id: file._id,
      file_id: file.file_id,
      source: file.source,
      filepath: file.filepath,
      file: fileBlob,
      type: file.type,
      preview: URL.createObjectURL(blob),
      progress: 1,
      size: fileBlob.size,
    };

    setFiles((currentFiles) => {
      const updatedFiles = new Map(currentFiles);
      updatedFiles.set(file.file_id, extendedFile);
      return updatedFiles;
    });
  }

  useEffect(() => {
    console.log('endppoint', endpoint, _endpoint);
  }, [endpoint, _endpoint]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage;
      }}
      className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
    >
      <div className="relative flex h-full flex-1 items-stretch md:flex-col">
        <div className="flex w-full items-center">
          <div className="[&:has(textarea:focus)]:border-token-border-xheavy border-token-border-heavy shadow-xs dark:shadow-xs relative flex w-full flex-grow flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:shadow-[0_0_0_2px_rgba(23,23,23,1)] [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
            <FileRow
              files={files}
              setFiles={setFiles}
              setFilesLoading={setFilesLoading}
              Wrapper={({ children }) => (
                <div className="mx-2 mt-2 flex flex-wrap gap-2 px-2.5 md:pl-0 md:pr-4">
                  {children}
                </div>
              )}
            />
            <SearchFileBubbleChat
              chatText={text}
              onSelectFile={(file, queryName) => {
                setText((prev) => {
                  const replaceRegex = new RegExp(`${queryName}`, 'g');
                  let updatedText = prev.replace(replaceRegex, '');
                  return updatedText;
                });
                handleSelectedFile(file);
              }}
            />
            {true && (
              <Textarea
                value={text}
                disabled={requiresKey}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                setText={setText}
                submitMessage={sendMessage}
                endpoint={endpoint ?? ""}
                endpointType={endpointType}
              />
            )}
            <AttachFile
              endpoint={'openAI' ?? ''}
              endpointType={endpointType}
              disabled={requiresKey}
            />
            {isSubmitting && showStopButton ? (
              <StopButton stop={handleStopGenerating} setShowStopButton={setShowStopButton} />
            ) : (
              true && (
                <div onClick={sendMessage}>
                  <SendButton text={text} disabled={filesLoading || isSubmitting || requiresKey} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
