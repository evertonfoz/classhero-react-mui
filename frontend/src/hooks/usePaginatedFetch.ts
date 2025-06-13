import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useDynamicLimit from './useDynamicLimit';

export default function usePaginatedFetch<T>(
  getUrl: (page: number, limit: number) => string,
  deps: any[] = [],
) {
  const { logout } = useAuth();
  const limit = useDynamicLimit();

  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return logout();

  setLoading(true);
  try {
    const url = getUrl(currentPage, limit);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (!response.ok) throw new Error('Erro ao buscar dados');

    // Se vier como array:
    if (Array.isArray(result)) {
      setData(result);
      setTotalPages(1);
    } else if (result.data) {
      setData(result.data);
      setTotalPages(result.totalPages || 1);
    } else {
      setData([]);
      setTotalPages(1);
    }
  } catch (err) {
    console.error(err);
    setData([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, ...deps]);

  return {
    data,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchData,
    limit,
  } as const;
}
