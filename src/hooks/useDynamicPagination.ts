import { useState, useEffect, useRef } from 'react';

interface UseDynamicPaginationProps {
  items: any[];
  containerRef: React.RefObject<HTMLDivElement>;
  itemWidth?: number;
  gap?: number;
}

interface UseDynamicPaginationResult {
  visibleItems: any[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  itemsPerPage: number;
}

export const useDynamicPagination = ({
  items,
  containerRef,
  itemWidth = 280,
  gap = 16
}: UseDynamicPaginationProps): UseDynamicPaginationResult => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 컨테이너 크기에 따라 아이템 수 계산
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - 32; // 좌우 패딩 고려
      const calculatedItems = Math.floor(availableWidth / (itemWidth + gap));
      
      const newItemsPerPage = Math.max(1, calculatedItems);
      setItemsPerPage(newItemsPerPage);
      
      const newTotalPages = Math.ceil(items.length / newItemsPerPage);
      setTotalPages(newTotalPages);
      
      // 현재 페이지가 총 페이지 수를 초과하면 마지막 페이지로 조정
      if (currentPage >= newTotalPages) {
        setCurrentPage(Math.max(0, newTotalPages - 1));
      }
    };

    calculateItemsPerPage();

    const resizeObserver = new ResizeObserver(calculateItemsPerPage);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [items.length, itemWidth, gap, currentPage, containerRef]);

  // 현재 페이지의 아이템들 계산
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleItems = items.slice(startIndex, endIndex);

  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    visibleItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    itemsPerPage
  };
}; 