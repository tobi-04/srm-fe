import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spin, Empty, Button } from "antd";
import { indicatorApi } from "../../api/indicatorApi";
import { getLandingPages, createLandingPage } from "../../api/landingPage";
import { LandingPageRenderer } from "../landing/LandingPageRenderer";
import SEO from "../../components/common/SEO";

const IndicatorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch indicator data
  const { data: indicator, isLoading: isLoadingIndicator } = useQuery({
    queryKey: ["indicator", slug],
    queryFn: () => indicatorApi.getBySlug(slug!).then((res: any) => res.data),
    enabled: !!slug,
  });

  // Fetch landing page for this indicator
  const { data: landingPageData, isLoading: isLoadingLandingPage } = useQuery({
    queryKey: ["landing-page-for-indicator", indicator?._id],
    queryFn: () => getLandingPages({ indicator_id: indicator?._id }),
    enabled: !!indicator?._id,
  });

  // Create landing page mutation
  const createLandingPageMutation = useMutation({
    mutationFn: (data: any) => createLandingPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["landing-page-for-indicator", indicator?._id],
      });
    },
  });

  const activeLandingPage = landingPageData?.data?.[0];

  // Auto-create landing page if not exists
  useEffect(() => {
    if (
      indicator &&
      !isLoadingLandingPage &&
      !activeLandingPage &&
      !createLandingPageMutation.isPending
    ) {
      createLandingPageMutation.mutate({
        resource_type: "indicator",
        indicator_id: indicator._id,
        title: indicator.name,
        slug: indicator.slug,
        status: "draft",
      });
    }
  }, [indicator, isLoadingLandingPage, activeLandingPage]);

  // Loading state
  if (
    isLoadingIndicator ||
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
        <Spin size="large" tip="Đang tải dữ liệu indicator..." />
      </div>
    );
  }

  // Indicator not found
  if (!indicator) {
    return (
      <Empty
        description="Không tìm thấy Indicator"
        style={{ padding: "100px 0" }}
      >
        <Button type="primary" onClick={() => navigate("/indicators")}>
          Quay lại danh sách
        </Button>
      </Empty>
    );
  }

  // Render landing page if exists
  if (activeLandingPage) {
    return (
      <>
        <SEO
          title={indicator.name}
          description={indicator.description}
          ogImage={indicator.cover_image}
        />
        <LandingPageRenderer landingPage={activeLandingPage} urlStep={2} />
      </>
    );
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

export default IndicatorDetailPage;
