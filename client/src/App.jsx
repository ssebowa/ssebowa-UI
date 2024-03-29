import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { RouterProvider, useLocation } from 'react-router-dom';
import * as RadixToast from '@radix-ui/react-toast';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ScreenshotProvider, ThemeProvider, useApiErrorBoundary } from './hooks';
import { ToastProvider } from './Providers';
import Toast from './components/ui/Toast';
import { router } from './routes';
import axios from 'axios';
import { createContext, useCallback, useEffect, useState } from 'react';

export const ChatDataContext = createContext(null);
const App = () => {
  const { setError } = useApiErrorBoundary();
  const [ssebowaData, setSSbowaData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [ssebowaConversations, setSsebowaConversations] = useState([]);
  const [ssebowaConversation, setSsebowaConversation] = useState({});
  const [convId, setConvId] = useState('new');

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error?.response?.status === 401) {
          setError(error);
        }
      },
    }),
  });
  useEffect(() => {
    const filter = ssebowaData.filter(
      (item) => item.text && item?.text != 'Please wait a minute, the image will soon appear',
    );
    setSSbowaData(filter);
  }, [isLoading]);

  const fetchSsebowaConversations = useCallback(async () => {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : '';
    const response = await axios.get('/api/ssebowa/ssebowa-conversation?id=' + userId);
    setSsebowaConversations(response.data);
  }, [setSsebowaConversations]);

  const fetchSsebowaConversation = useCallback(
    async (id) => {
      const response = await axios.get('/api/ssebowa/ssebowa-conversation/' + id);
      setSsebowaConversation(response.data);
      return response;
    },
    [setSsebowaConversations],
  );

  const specificImageGenerationWords = ['generate', 'draw', 'design'];
  const submitChatMessage = useCallback(async (data) => {
    const formData = new FormData();
    formData.append('prompt', data.text);
    const fileListId = [];
    const fileList = []
    data.files.forEach((file) => {
      fileList.push(file)
      fileListId.push(file._id)
      formData.append('image', file.file);
    });
    try {
      setIsLoading(true);
      setSSbowaData((prevData) => [
        ...prevData,
        {
          sentByUser: true,
          text: data?.text,
          files: fileList,
        },
      ]);
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : '';
      const resMessage = await axios.post('/api/ssebowa/ssebowa-message', {
        sender: 'User',
        text: data?.text,
        user: userId,
        files: fileListId,
      });
      const localConvId = localStorage.getItem('conversationId');
      let convMessage = { data: { _id: localConvId } };
      if (localConvId === 'new') {
        convMessage = await axios.post('/api/ssebowa/ssebowa-conversation', {
          user: userId,
          title: 'New Chat',
          messages: [],
        });
        await fetchSsebowaConversations();
      }
      // if (localConvId !== 'new') {
      await axios.put(`/api/ssebowa/ssebowa-conversation/${convMessage.data._id}/messages`, {
        messages: resMessage.data._id,
      });
      if (localConvId === 'new') {
        await axios.put('/api/ssebowa/ssebowa-conversation/' + convMessage.data._id, {
          title: data?.text.substring(0, 25),
        });
        await fetchSsebowaConversations();
      }
      // } else {
      //   convMessage = await axios.post('/api/ssebowa/ssebowa-conversation', { user: userId, title: data?.text.substring(0, 25), messages: [resMessage.data._id] })
      // }
      const includesSpecificWord = specificImageGenerationWords.some((word) =>
        data?.text?.toLowerCase().includes(word),
      );
      setTimeout(() => {
        setSSbowaData((prevData) => [
          ...prevData,
          {
            sentByUser: false,
            isImage: false,
            text: includesSpecificWord ? 'Please wait a minute, the image will soon appear' : '',
          },
        ]);
      }, 100);
      const response = await axios.post('https://api5.ssebowa.chat/ssebowavlm', formData, {
        headers: {
          'API-KEY': 'ssebowa_3a4b8f7c2e1d6a9b5d8c3e2f1a7b6e9',
        },
      });
      setTimeout(async () => {
        setSSbowaData((prevData) => [
          ...prevData,
          {
            sentByUser: false,
            isImage: includesSpecificWord,
            text: response?.data,
          },
        ]);
        const resMessage2 = await axios.post('/api/ssebowa/ssebowa-message', {
          sender: 'SsebowaAI',
          text: response?.data,
          user: userId,
          isImage: includesSpecificWord,
        });
        const convMessage2 = await axios.put(
          `/api/ssebowa/ssebowa-conversation/${convMessage.data._id}/messages`,
          { messages: resMessage2.data._id },
        );
      }, 10);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const user = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : '';

  useEffect(() => {
    fetchSsebowaConversations();
  }, [fetchSsebowaConversations, userId]);

  useEffect(() => {
    //
  }, [convId]);

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ThemeProvider>
          <RadixToast.Provider>
            <ToastProvider>
              <DndProvider backend={HTML5Backend}>
                <ChatDataContext.Provider
                  value={{
                    submitChatMessage,
                    ssebowaData,
                    setSSbowaData,
                    isLoading,
                    setIsLoading,
                    ssebowaConversations,
                    ssebowaConversation,
                    fetchSsebowaConversation,
                    convId,
                    setConvId,
                    fetchSsebowaConversations,
                  }}
                >
                  <RouterProvider router={router} />
                </ChatDataContext.Provider>
                <ReactQueryDevtools initialIsOpen={false} position="top-right" />
                <Toast />
                <RadixToast.Viewport className="pointer-events-none fixed inset-0 z-[1000] mx-auto my-2 flex max-w-[560px] flex-col items-stretch justify-start md:pb-5" />
              </DndProvider>
            </ToastProvider>
          </RadixToast.Provider>
        </ThemeProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
};

export default () => (
  <ScreenshotProvider>
    <App />
  </ScreenshotProvider>
);
