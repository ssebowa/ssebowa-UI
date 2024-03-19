import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { RouterProvider } from 'react-router-dom';
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
    const filter = ssebowaData.filter((item) => item.text && item?.text != 'Please wait a minute, the image will soon appear');
    setSSbowaData(filter);
  }, [isLoading]);

  const specificImageGenerationWords = ['generate', 'draw', 'design'];
  const submitChatMessage = useCallback(async (data) => {
    const formData = new FormData();
    formData.append('prompt', data.text);
    data.files.forEach((file) => {
      formData.append('image', file.file);
    });
    try {
      setIsLoading(true);
      setSSbowaData((prevData) => [...prevData, { sentByUser: true, text: data?.text }]);
      const includesSpecificWord = specificImageGenerationWords.some(word => data?.text?.toLowerCase().includes(word));
      setTimeout(() => {
        setSSbowaData((prevData) => [...prevData, { sentByUser: false, isImage: false, text: includesSpecificWord ? 'Please wait a minute, the image will soon appear' : '' }]);
      }, 100);
      const response = await axios.post('https://api5.ssebowa.chat/ssebowavlm', formData, {
        headers: {
          'API-KEY': 'your_api_key',
        },
      });
      setTimeout(() => {
        setSSbowaData((prevData) => [...prevData, {
          sentByUser: false, isImage: includesSpecificWord,
          text: response?.data,
        }]);
      }, 10);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ThemeProvider>
          <RadixToast.Provider>
            <ToastProvider>
              <DndProvider backend={HTML5Backend}>
                <ChatDataContext.Provider value={{ submitChatMessage, ssebowaData, isLoading }}>
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
