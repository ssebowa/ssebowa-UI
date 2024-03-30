import { useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
// import type { TMessage } from 'librechat-data-provider';
import ScrollToBottom from '~/components/Messages/ScrollToBottom';
import { useScreenshot, useMessageScrolling } from '~/hooks';
import { CSSTransition } from 'react-transition-group';
import { ChatDataContext } from '~/App';
import { ExtendedFile } from '~/common';
import MessageCard from '~/components/Chat/Messages/MessageCard';

export default function MessagesView({
  messagesTree: _messagesTree,
  Header,
}: {
  // messagesTree?: TMessage[] | null;
  messagesTree?: [
    {
      messageId: string;
      feedback: 'positive' | 'negative';
      sentByUser: boolean;
      text: string;
      isImage: boolean;
      files: ExtendedFile[];
    },
  ];
  Header?: ReactNode;
}) {
  const { screenshotTargetRef } = useScreenshot();
  const [editMessage, setEditMessage] = useState({
    idx: -1,
    enable: false,
    message: '',
  });

  const {
    conversation,
    scrollableRef,
    messagesEndRef,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  } = useMessageScrolling(_messagesTree);
  const { updateChatMessage } = useContext(ChatDataContext);

  const handleSubmitEditMessage = async () => {
    const message = _messagesTree?.[editMessage.idx];
    const fileMap = new Map();
    const getAllFile = message?.files?.map(async (file) => {
      const imgUrl =
        file.source === 'local' ? `${window.location.origin}${file.filepath}` : file.filepath;
      if (!imgUrl) return;
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const fileBlob = new File([blob], file.filename ?? '', { type: file.type });

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
      fileMap.set(file.file_id, extendedFile);
    });
    if (getAllFile) {
      await Promise.all(getAllFile);
    }
    updateChatMessage({
      messageId: message?.messageId ?? '',
      text: editMessage.message,
      files: fileMap,
      answerId: _messagesTree?.[editMessage.idx + 1]?.messageId ?? '',
    });
    setEditMessage({
      idx: -1,
      enable: false,
      message: '',
    });
  };

  return (
    <div className="flex-1 overflow-hidden overflow-y-auto">
      <div className="dark:gpt-dark-gray relative h-full">
        <div
          onScroll={debouncedHandleScroll}
          ref={scrollableRef}
          style={{
            height: '100%',
            overflowY: 'auto',
            width: '100%',
          }}
        >
          <div className="flex flex-col pb-9 text-sm dark:bg-transparent">
            {(_messagesTree && !_messagesTree?.length) || _messagesTree === null ? (
              <div className="flex w-full items-center justify-center gap-1 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-800/50 dark:bg-gray-900 dark:text-gray-300">
                Nothing found
              </div>
            ) : (
              <>
                {Header && Header}
                {/* <div ref={screenshotTargetRef}>
                  <MultiMessage
                    key={conversationId} // avoid internal state mixture
                    messagesTree={_messagesTree}
                    messageId={conversationId ?? null}
                    setCurrentEditId={setCurrentEditId}
                    currentEditId={currentEditId ?? null}
                  />
                </div> */}
                {/* <div>{_messagesTree?.length}</div> */}
                <div ref={screenshotTargetRef}>
                  <>
                    {_messagesTree?.map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          className="text-token-text-primary w-full border-0 bg-transparent dark:border-0 dark:bg-transparent"
                        >
                          <div className="m-auto justify-center p-4 py-2 text-base md:gap-6 ">
                            <div className={`
                                group mx-auto flex flex-1 gap-3 text-base md:max-w-3xl 
                                md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5
                                ${item?.sentByUser ? 'mt-3' : ''}
                              `}>
                              <div className="relative flex flex-shrink-0 flex-col items-end">
                                <div>
                                  <div className="pt-0.5">
                                    <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
                                      {item?.sentByUser ? (
                                        <div
                                          className="relative flex h-9 w-9 items-center justify-center rounded-full p-1 text-white"
                                          style={{
                                            backgroundColor: 'rgb(121, 137, 255)',
                                            width: '28px',
                                            height: '28px',
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                          </svg>
                                        </div>
                                      ) : (
                                        <img src={'/assets/ssebowaIcon.png'} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <MessageCard
                                item={item}
                                idx={idx}
                                editMessage={editMessage}
                                setEditMessage={setEditMessage}
                                handleSubmitEditMessage={handleSubmitEditMessage}
                                conversation={conversation}
                                listLength={_messagesTree?.length}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                </div>
              </>
            )}
            <div
              className="dark:gpt-dark-gray group h-0 w-full flex-shrink-0 dark:border-gray-800/50"
              ref={messagesEndRef}
            />
          </div>
        </div>
        <CSSTransition
          in={showScrollButton}
          timeout={400}
          classNames="scroll-down"
          unmountOnExit={false}
          // appear
        >
          {() => showScrollButton && <ScrollToBottom scrollHandler={handleSmoothToRef} />}
        </CSSTransition>
      </div>
    </div>
  );
}
