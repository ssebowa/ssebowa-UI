import axios from 'axios';

export const updateFeedbackMessageById = async (
  id: string,
  data: { feedback: 'negative' | 'positive' },
) => {
  const response = await axios.put(`/api/ssebowa/ssebowa-message/${id}/feedback`, data);
  return response;
};
