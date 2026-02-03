import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spin, Empty, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { getLandingPages, createLandingPage } from "../../api/landingPage";
import { LandingPageRenderer } from "../landing/LandingPageRenderer";

const BookDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch book data
  const { data: book, isLoading: isLoadingBook } = useQuery({
    queryKey: ["book", slug],
    queryFn: () => bookApi.getBookBySlug(slug!).then((res) => res.data),
    enabled: !!slug,
  });

  // Fetch landing page for this book
  const { data: landingPageData, isLoading: isLoadingLandingPage } = useQuery({
    queryKey: ["landing-page-for-book", book?._id],
    queryFn: () => getLandingPages({ book_id: book?._id }),
    enabled: !!book?._id,
  });

  // Create landing page mutation
  const createLandingPageMutation = useMutation({
    mutationFn: (data: any) => createLandingPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["landing-page-for-book", book?._id],
      });
    },
  });

  const activeLandingPage = landingPageData?.data?.[0];

  // Auto-create landing page if not exists
  useEffect(() => {
    if (
      book &&
      !isLoadingLandingPage &&
      !activeLandingPage &&
      !createLandingPageMutation.isPending
    ) {
      createLandingPageMutation.mutate({
        resource_type: "book",
        book_id: book._id,
        title: book.title,
        slug: book.slug,
        status: "draft",
      });
    }
  }, [book, isLoadingLandingPage, activeLandingPage]);

  // Loading state
  if (
    isLoadingBook ||
    isLoadingLandingPage ||
    createLandingPageMutation.isPending
  ) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu sách..." />
      </div>
    );
  }

  // Book not found
  if (!book) {
    return (
      <Empty
        description="Không tìm thấy sách phù hợp"
        style={{ padding: "100px 0" }}
      >
        <Button type="primary" onClick={() => navigate("/books")}>
          Quay lại cửa hàng
        </Button>
      </Empty>
    );
  }

  // Render landing page if exists
  if (activeLandingPage) {
    return <LandingPageRenderer landingPage={activeLandingPage} urlStep={2} />;
  }

  // Fallback (should not reach here due to auto-create)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" tip="Đang khởi tạo trang..." />
    </div>
  );
};

export default BookDetailPage;
