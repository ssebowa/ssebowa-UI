import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMessagesByConvoId } from 'librechat-data-provider/react-query';
import { ChatContext, useFileMapContext } from '~/Providers';
import MessagesView from './Messages/MessagesView';
import { useChatHelpers, useSSE } from '~/hooks';
import { Spinner } from '~/components/svg';
import Presentation from './Presentation';
import ChatForm from './Input/ChatForm';
import { buildTree } from '~/utils';
import Landing from './Landing';
import Header from './Header';
// import Footer from './Footer';
import store from '~/store';
import { ChatDataContext } from '~/App';

function ChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const submissionAtIndex = useRecoilValue(store.submissionByIndex(0));
  useSSE(submissionAtIndex);

  const fileMap = useFileMapContext();

  const { data: messagesTree = null, isLoadingA } = useGetMessagesByConvoId(conversationId ?? '', {
    select: (data) => {
      const dataTree = buildTree({ messages: data, fileMap });
      return dataTree?.length === 0 ? null : dataTree ?? null;
    },
    enabled: !!fileMap,
  });

  const [isLoading, setIsLoading] = useState(false)
  
  const { ssebowaData, ssebowaConversations, fetchSsebowaConversation, setSSbowaData, setConvId } = useContext(ChatDataContext);
  // const [cloneSsebowaData, setCloneSsebowaData] = useState([])

  // useEffect(() => {
  //   setCloneSsebowaData(ssebowaData)
  // }, [ssebowaData])

  const navigate = useNavigate()

  const getConversation = useCallback(async (id) => {
    try {
      setIsLoading(true)
      const res = await fetchSsebowaConversation(id)
      const mapRes = res.data.messages.map(message => {
        return {
          sentByUser: message.sender === 'User',
          files: message.files,
          isImage: message.isImage,
          text: message.text
        }
      })
      if(ssebowaData.length === 0 || !ssebowaData.some(r=> mapRes.map(r2 => JSON.stringify(r2)).includes(JSON.stringify(r)))){
        setSSbowaData((prevData) => [...prevData, ...mapRes]);
      }
    }catch(err){
      console.log(err)
      navigate('/c/new')
    }finally{
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setConvId(conversationId)
    const oldConversationId = localStorage.getItem('conversationId')
    if(conversationId !== oldConversationId){
      setSSbowaData([])
    }
    localStorage.setItem('conversationId', conversationId || '')
    if(conversationId !== 'new') {
      getConversation(conversationId)
    }else{
      setSSbowaData([])
    }
  }, [conversationId])
  
  const chatHelpers = useChatHelpers(index, conversationId);
  return (
    <ChatContext.Provider value={chatHelpers}>
      <Presentation useSidePanel={true}>
        {isLoading && conversationId !== 'new' ? (
          <div className="flex h-screen items-center justify-center">
            <Spinner className="opacity-0" />
          </div>
        ) : ssebowaData && ssebowaData.length ? (
          <MessagesView messagesTree={ssebowaData} Header={<Header />} />
        ) : (
          <Landing Header={<Header />} />
        )}
        <div className="w-full border-t-0 pl-0 pt-2 dark:border-white/20 md:w-[calc(100%-.5rem)] md:border-t-0 md:border-transparent md:pl-0 md:pt-0 md:dark:border-transparent">
          <ChatForm index={index} />
          {/* <Footer /> */}
        </div>
      </Presentation>
    </ChatContext.Provider>
  );
}

export default memo(ChatView);
