import {
  CopyIcon,
  EditIcon,
  RotateCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from 'lucide-react';
import { useContext, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { ChatDataContext } from '~/App';
import { NotificationSeverity } from '~/common';
import Textarea from '~/components/Chat/Input/Textarea';
import { updateFeedbackMessageById } from '~/data-provider/axios';
import { useToast } from '~/hooks';
import { cn } from '~/utils';

export default function MessageCard({
  item,
  idx,
  editMessage,
  setEditMessage,
  conversation,
  handleSubmitEditMessage,
  listLength,
}) {
  const [containerMessageHovering, setContainerMessageHovering] = useState(false);
  const { updateChatMessage, setSSbowaData, isLoading } = useContext(ChatDataContext);

  const { showToast } = useToast();
  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: '' };
  const endpoint = endpointType ?? _endpoint;

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
  return (
    <div className={cn('relative flex w-full flex-col', item?.sentByUser ? '' : 'agent-turn')}>
      <div className="select-none font-semibold">{item?.sentByUser ? 'You' : 'SsebowaAI'}</div>
      <div className="flex-col gap-1 md:gap-3">
        <div
          className={`
            duration-[1000ms] -mx-4 mt-2 flex max-w-full 
            flex-grow flex-col gap-0 rounded-xl 
            px-4 transition-[color_transform] ease-in
            ${
              editMessage.idx === idx && editMessage.enable
                ? `py-3 scale-[1.002] bg-gray-900 border-2 !border-gray-800
                    shadow-[0_0_10px_5px_rgba(0,0,0,0.10)]
                `
                : ''
            }
            ${
              !item?.sentByUser
                ? `py-3 bg-gray-900 border-2 border-gray-800
                    shadow-[0_0_10px_5px_rgba(0,0,0,0.10)]`
                : 'py-2 border-2 border-transparent'
            }
        `}
          onMouseEnter={() => setContainerMessageHovering(true)}
          onMouseLeave={() => setContainerMessageHovering(false)}
        >
          {item?.isImage ? (
            <img src={item?.text} className="mt-2 max-h-[500px] rounded" />
          ) : !item?.sentByUser && idx === listLength - 1 ? (
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
              {item?.files?.length > 0 && item?.files?.[0].type?.includes('image') ? (
                <img
                  src={
                    item?.files?.[0].source === 'local'
                      ? `${window.location.origin}${item.files?.[0].filepath}`
                      : item.files?.[0].filepath
                  }
                  className="my-2 mb-4 rounded"
                />
              ) : null}
              {editMessage.idx === idx && editMessage.enable ? (
                <Textarea
                  value={editMessage.message}
                  disabled={false}
                  onChange={(e) =>
                    setEditMessage({
                      ...editMessage,
                      message: e.target.value,
                    })
                  }
                  submitMessage={() => {}}
                  setText={(value) =>
                    setEditMessage({
                      ...editMessage,
                      message: value as string,
                    })
                  }
                  endpoint={endpoint ?? ''}
                  endpointType={endpointType}
                  extendedClassname="!ml-[-55px] !pr-[0]"
                />
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{item?.text}</div>
              )}
            </>
          )}
          {editMessage.idx === idx && editMessage.enable ? (
            <div className="mt-1 gap-x-2">
              <div className="inline-flex px-1 pt-1" onClick={handleSubmitEditMessage}>
                <RotateCcwIcon
                  size={18}
                  className="duration-[500ms] stroke-green-500 transition-all hover:stroke-green-600"
                />
              </div>
              <div
                className="inline-flex px-1 pt-1"
                onClick={() => {
                  setEditMessage({
                    idx: -1,
                    enable: false,
                    message: '',
                  });
                }}
              >
                <XIcon
                  size={18}
                  className="duration-[500ms] stroke-gray-400 transition-all hover:stroke-white"
                />
              </div>
            </div>
          ) : (
            <div
              className={
                containerMessageHovering
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
                <div
                  className="inline-flex px-1 pt-1"
                  onClick={() => {
                    setEditMessage({
                      idx,
                      enable: true,
                      message: item?.text,
                    });
                  }}
                >
                  <EditIcon
                    size={18}
                    className="duration-[500ms] stroke-gray-400 transition-all hover:stroke-white"
                  />
                </div>
              ) : (
                <>
                  <div
                    className="inline-flex px-1 pt-1"
                    onClick={() => handleOnClickFeedback(item?.messageId, 'positive')}
                  >
                    <ThumbsUpIcon
                      size={18}
                      className={`
                        duration-[500ms] transition-all ${
                          item?.feedback === 'positive'
                            ? 'stroke-green-500'
                            : 'stroke-gray-400 hover:stroke-white'
                        }`}
                    />
                  </div>
                  <div
                    className="inline-flex px-1 pt-1"
                    onClick={() => handleOnClickFeedback(item?.messageId, 'negative')}
                  >
                    <ThumbsDownIcon
                      size={18}
                      className={`
                        duration-[500ms] transition-all ${
                          item?.feedback === 'negative'
                            ? 'stroke-red-500'
                            : 'stroke-gray-400 hover:stroke-white'
                        }`}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
