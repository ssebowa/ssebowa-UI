import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
// import type { TMessage } from 'librechat-data-provider';
import ScrollToBottom from '~/components/Messages/ScrollToBottom';
import { useScreenshot, useMessageScrolling, useToast } from '~/hooks';
import { CSSTransition } from 'react-transition-group';
import MultiMessage from './MultiMessage';
import MessageContent from './Content/MessageContent';
import { cn } from '~/utils';
import { TypeAnimation } from 'react-type-animation';
import { ChatDataContext } from '~/App';
import { useParams } from 'react-router-dom';
import { ExtendedFile, NotificationSeverity } from '~/common';
import { CopyIcon, EditIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { updateFeedbackMessageById } from '~/data-provider/axios';

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
  const [containerMessageHovering, setContainerMessageHovering] = useState({
    item: -1,
    hover: false,
  });

  const { showToast } = useToast();
  const {
    conversation,
    scrollableRef,
    messagesEndRef,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  } = useMessageScrolling(_messagesTree);
  const { conversationId } = conversation ?? {};
  const { setSSbowaData, isLoading } = useContext(ChatDataContext);

  useEffect(() => {
    // getConversation(conversationId)
  }, [_messagesTree]);

  const handleCopyClick = (textToCopy: string) => {
    // For modern browsers
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() =>
          showToast({
            message: 'Text copied to clipboard',
            severity: NotificationSeverity.SUCCESS,
          }),
        )
        .catch((error) => {
          showToast({
            message: 'Error copying text to clipboard',
            severity: NotificationSeverity.ERROR,
          });
          console.error('Error copying text:', error);
        });
    } else {
      // For older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast({
        message: 'Text copied to clipboard',
        severity: NotificationSeverity.SUCCESS,
      });
    }
  };

  const handleOnClickFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    const response = await updateFeedbackMessageById(messageId, { feedback });
    if (response.status === 200) {
      setSSbowaData((prev) => {
        return prev.map((msg) => {
          if (msg.messageId === messageId) {
            return { ...msg, feedback };
          }
          return msg;
        });
      });
    }
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
              <div className="flex w-full items-center justify-center gap-1 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-800/50 dark:bg-gray-800 dark:text-gray-300">
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
                            <div className="} group mx-auto flex flex-1 gap-3 text-base md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5">
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
                              <div
                                className={cn(
                                  'relative flex w-full flex-col',
                                  item?.sentByUser ? '' : 'agent-turn',
                                )}
                              >
                                <div className="select-none font-semibold">
                                  {item?.sentByUser ? 'You' : 'SsebowaAI'}
                                </div>
                                <div className="flex-col gap-1 md:gap-3">
                                  <div
                                    className={`
                                      duration-[1000ms] -mx-4 mt-2 flex max-w-full 
                                      flex-grow flex-col gap-0 rounded-xl 
                                      px-4 py-3 transition-all
                                      ease-in hover:scale-[1.002]
                                      hover:shadow-[0_0_10px_5px_rgba(0,0,0,0.10)]
                                    `}
                                    onMouseEnter={() =>
                                      setContainerMessageHovering({
                                        item: idx,
                                        hover: true,
                                      })
                                    }
                                    onMouseLeave={() =>
                                      setContainerMessageHovering({
                                        item: idx,
                                        hover: false,
                                      })
                                    }
                                  >
                                    {item?.isImage ? (
                                      <img
                                        src={item?.text}
                                        className="mt-2 max-h-[500px] rounded"
                                      />
                                    ) : !item?.sentByUser && idx == _messagesTree?.length - 1 ? (
                                      <TypeAnimation
                                        splitter={(str) => str.split(/(?= )/)}
                                        sequence={[item?.text, 3000, item?.text]}
                                        style={{ whiteSpace: 'pre-wrap' }}
                                        speed={{ type: 'keyStrokeDelayInMs', value: 30 }}
                                        repeat={0}
                                        cursor={isLoading}
                                      />
                                    ) : (
                                      <>
                                        {item?.files.length > 0 &&
                                        item?.files?.[0].type?.includes('image') ? (
                                          <img
                                            src={
                                              item?.files?.[0].source === 'local'
                                                ? `${window.location.origin}${item.files?.[0].filepath}`
                                                : item.files?.[0].filepath
                                            }
                                            className="my-2 mb-4 rounded"
                                          />
                                        ) : null}
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{item?.text}</div>
                                      </>
                                    )}
                                    <div
                                      className={
                                        idx === containerMessageHovering.item &&
                                        containerMessageHovering.hover
                                          ? 'pointer-events-auto mt-1 opacity-100'
                                          : 'pointer-events-none mt-1 opacity-0'
                                      }
                                    >
                                      {!item?.isImage ? (
                                        <div
                                          className="inline-flex px-1 pt-1"
                                          onClick={() => {
                                            handleCopyClick(item?.text);
                                          }}
                                        >
                                          <CopyIcon
                                            size={18}
                                            className="duration-[500ms] stroke-gray-400 transition-all hover:stroke-white"
                                          />
                                        </div>
                                      ) : null}
                                      {item?.sentByUser ? (
                                        <div className="inline-flex px-1 pt-1">
                                          <EditIcon
                                            size={18}
                                            className="duration-[500ms] stroke-gray-400 transition-all hover:stroke-white"
                                          />
                                        </div>
                                      ) : (
                                        <>
                                          <div
                                            className="inline-flex px-1 pt-1"
                                            onClick={() =>
                                              handleOnClickFeedback(item?.messageId, 'positive')
                                            }
                                          >
                                            <ThumbsUpIcon
                                              size={18}
                                              className={`
                                              duration-[500ms] stroke-gray-400 transition-all 
                                              hover:stroke-white ${
                                                item?.feedback === 'positive'
                                                  ? 'stroke-green-500'
                                                  : ''
                                              }`}
                                            />
                                          </div>
                                          <div
                                            className="inline-flex px-1 pt-1"
                                            onClick={() =>
                                              handleOnClickFeedback(item?.messageId, 'negative')
                                            }
                                          >
                                            <ThumbsDownIcon
                                              size={18}
                                              className={`
                                              duration-[500ms] stroke-gray-400 transition-all 
                                              hover:stroke-white ${
                                                item?.feedback === 'negative'
                                                  ? 'stroke-red-500'
                                                  : ''
                                              }`}
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
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
