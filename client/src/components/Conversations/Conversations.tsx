import { useContext, useEffect, useMemo, useState } from 'react';
import { parseISO, isToday } from 'date-fns';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TConversation } from 'librechat-data-provider';
import { groupConversationsByDate } from '~/utils';
import Conversation from './Conversation';
import Convo from './Convo';
import { ChatDataContext } from '~/App';

export default function Conversations({
  conversations,
  moveToTop,
  toggleNav,
}: {
  conversations: TConversation[];
  moveToTop: () => void;
  toggleNav: () => void;
}) {
  const location = useLocation();
  const { pathname } = location;
  const ConvoItem = pathname.includes('chat') ? Conversation : Convo;
  const groupedConversations = useMemo(
    () => groupConversationsByDate(conversations),
    [conversations],
  );
  const firstTodayConvoId = conversations.find((convo) =>
    isToday(parseISO(convo.updatedAt)),
  )?.conversationId;

  const { ssebowaConversations } = useContext(ChatDataContext);

  const navigate = useNavigate()
  const { conversationId } = useParams()
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    // This effect will run only after the first render
    if (!initialRender) {
      // Perform your side effect here
      if(ssebowaConversations.length > 0 && conversationId !== ssebowaConversations[0]._id){
        navigate(`/c/${ssebowaConversations[0]._id}`)
      }else{
        
      }

      if(ssebowaConversations.length === 0){
        navigate('/c/new')
      }
    } else {
      // Set initialRender to false after the first render
      setInitialRender(false);
    }
  }, [ssebowaConversations])

  return (
    <div className="text-token-text-primary flex flex-col gap-2 pb-2 text-sm">
      <div>
        <span>
          {[1].map((groupName) => (
            <div key={groupName}>
              {/* <div
                style={{
                  color: '#aaa',
                  fontSize: '0.7rem',
                  marginTop: '20px',
                  marginBottom: '5px',
                  paddingLeft: '10px',
                }}
              >
                {groupName}
              </div> */}
              {ssebowaConversations.map((convo, i) => (
                <ConvoItem
                  key={`${groupName}-${convo._id}-${i}`}
                  isLatestConvo={convo._id === firstTodayConvoId}
                  conversation={convo}
                  retainView={moveToTop}
                  toggleNav={toggleNav}
                />
              ))}
              <div
                style={{
                  marginTop: '5px',
                  marginBottom: '5px',
                }}
              />
            </div>
          ))}
        </span>
      </div>
    </div>
  );
}
