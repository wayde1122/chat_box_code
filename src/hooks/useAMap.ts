"use client";

import React from "react";
import type { GeoLocation, Attraction, RouteInfo } from "@/types/travel";

/** 高德地图实例类型 */
interface AMapInstance {
  Map: new (
    container: string | HTMLElement,
    options?: Record<string, unknown>
  ) => MapInstance;
  Marker: new (options?: Record<string, unknown>) => MarkerInstance;
  Polyline: new (options?: Record<string, unknown>) => PolylineInstance;
  InfoWindow: new (options?: Record<string, unknown>) => InfoWindowInstance;
  LngLat: new (lng: number, lat: number) => LngLatInstance;
}

interface MapInstance {
  add: (overlay: unknown) => void;
  remove: (overlay: unknown) => void;
  clearMap: () => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setFitView: (
    overlays?: unknown[],
    immediately?: boolean,
    avoid?: number[]
  ) => void;
  destroy: () => void;
  resize: () => void;
  on: (event: string, handler: () => void) => void;
}

interface MarkerInstance {
  setMap: (map: MapInstance | null) => void;
  on: (event: string, handler: () => void) => void;
  getPosition: () => LngLatInstance;
}

interface PolylineInstance {
  setMap: (map: MapInstance | null) => void;
}

interface InfoWindowInstance {
  open: (map: MapInstance, position: [number, number]) => void;
  close: () => void;
}

interface LngLatInstance {
  getLng: () => number;
  getLat: () => number;
}

/** Hook 状态 */
interface AMapState {
  /** 地图是否已加载 */
  loaded: boolean;
  /** 加载错误 */
  error: string | null;
}

/** Hook 返回值 */
interface UseAMapReturn extends AMapState {
  /** 地图容器 ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 在地图上标注景点 */
  markAttractions: (attractions: Attraction[]) => void;
  /** 绘制路线 */
  drawRoute: (route: RouteInfo) => void;
  /** 清除所有标注 */
  clearMarkers: () => void;
  /** 设置地图中心 */
  setCenter: (location: GeoLocation, zoom?: number) => void;
  /** 自适应显示所有标注 */
  fitView: () => void;
  /** 刷新地图尺寸 */
  resize: () => void;
}

// 高德地图 API Key (Web JS API)
// 参考: https://lbs.amap.com/api/loca-v2/intro
const AMAP_KEY =
  process.env.NEXT_PUBLIC_AMAP_API_KEY ?? "24af2086cb80acca41901260709ac7de";
const AMAP_SECURITY_KEY =
  process.env.NEXT_PUBLIC_AMAP_SECURITY_KEY ??
  "8d50801152db1d24c0be85b39c231b87";

/**
 * 高德地图 Hook
 * 管理地图实例和标注
 */
export function useAMap(): UseAMapReturn {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapInstance | null>(null);
  const AMapRef = React.useRef<AMapInstance | null>(null);
  const markersRef = React.useRef<MarkerInstance[]>([]);
  const polylinesRef = React.useRef<PolylineInstance[]>([]);

  const [state, setState] = React.useState<AMapState>({
    loaded: false,
    error: null,
  });

  // 初始化地图
  React.useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    const initMap = async () => {
      try {
        // 确保只在浏览器环境运行
        if (typeof window === "undefined") return;

        // 设置安全配置（安全密钥）
        // 参考：https://lbs.amap.com/api/loca-v2/intro
        (
          window as unknown as {
            _AMapSecurityConfig: { securityJsCode: string };
          }
        )._AMapSecurityConfig = {
          securityJsCode: AMAP_SECURITY_KEY,
        };

        // 动态导入高德地图加载器，避免 SSR 问题
        const AMapLoader = (await import("@amap/amap-jsapi-loader")).default;

        const AMap = await AMapLoader.load({
          key: AMAP_KEY,
          version: "2.0",
          plugins: [
            "AMap.Driving",
            "AMap.Geocoder",
            "AMap.Scale",
            "AMap.ToolBar",
          ],
        });

        if (destroyed) return;

        AMapRef.current = AMap;

        // 确保容器有尺寸
        const container = containerRef.current!;

        const map = new AMap.Map(container, {
          zoom: 12,
          center: [116.397428, 39.90923], // 默认北京
          viewMode: "2D",
          resizeEnable: true,
        });

        mapRef.current = map;

        // 地图加载完成后触发 resize 确保正确渲染
        map.on("complete", () => {
          console.log("[useAMap] 地图加载完成");
          map.resize();
        });

        setState({ loaded: true, error: null });

        // 延迟 resize 确保容器尺寸正确
        setTimeout(() => {
          if (mapRef.current && !destroyed) {
            mapRef.current.resize();
          }
        }, 100);
      } catch (error) {
        if (destroyed) return;

        let message = "加载地图失败";

        if (error instanceof Error) {
          // 处理高德地图常见错误
          if (error.message.includes("USERKEY_PLAT_NOMATCH")) {
            message =
              "API Key 平台不匹配，请在高德开放平台配置 Web JS API 权限";
          } else if (error.message.includes("INVALID_USER_KEY")) {
            message = "无效的 API Key";
          } else {
            message = error.message;
          }
        }

        console.error("[useAMap] 初始化失败:", message);
        setState({ loaded: false, error: message });
      }
    };

    initMap();

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // 监听窗口 resize
  React.useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * 刷新地图尺寸
   */
  const resize = React.useCallback(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, []);

  /**
   * 在地图上标注景点
   * 参考高德地图官方示例实现
   */
  const markAttractions = React.useCallback((attractions: Attraction[]) => {
    const AMap = AMapRef.current;
    const map = mapRef.current;
    if (!AMap || !map) {
      console.log("[useAMap] 地图未初始化，无法标注景点");
      return;
    }

    console.log(`[useAMap] 标注 ${attractions.length} 个景点`);

    // 清除现有标注
    for (const marker of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];

    // 添加景点标记
    attractions.forEach((attraction, index) => {
      const marker = new AMap.Marker({
        position: [attraction.location.longitude, attraction.location.latitude],
        title: attraction.name,
        label: {
          content: `<div style="
            background: linear-gradient(135deg, #06b6d4, #8b5cf6);
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${index + 1}. ${attraction.name}</div>`,
          direction: "top",
          offset: [0, -5],
        },
      });

      // 点击显示信息窗口
      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #1e293b;">${
              attraction.name
            }</h3>
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
              📍 ${attraction.address}
            </p>
            ${
              attraction.ticketPrice > 0
                ? `
              <p style="margin: 0 0 6px; font-size: 12px; color: #f59e0b;">
                🎫 门票: ¥${attraction.ticketPrice}
              </p>
            `
                : ""
            }
            ${
              attraction.duration
                ? `
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                ⏱️ 建议游玩: ${attraction.duration}小时
              </p>
            `
                : ""
            }
          </div>
        `,
        offset: [0, -30],
      });

      marker.on("click", () => {
        infoWindow.open(map, [
          attraction.location.longitude,
          attraction.location.latitude,
        ]);
      });

      map.add(marker);
      markersRef.current.push(marker);
    });

    // 设置地图中心和缩放级别
    if (attractions.length > 0) {
      // 计算所有景点的中心点
      const lngs = attractions.map((a) => a.location.longitude);
      const lats = attractions.map((a) => a.location.latitude);
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

      // 先设置中心点
      map.setCenter([centerLng, centerLat]);

      // 根据景点数量和分布调整缩放级别
      const lngSpan = Math.max(...lngs) - Math.min(...lngs);
      const latSpan = Math.max(...lats) - Math.min(...lats);
      const maxSpan = Math.max(lngSpan, latSpan);

      // 计算合适的缩放级别
      let zoom = 12;
      if (maxSpan > 1) zoom = 8;
      else if (maxSpan > 0.5) zoom = 9;
      else if (maxSpan > 0.2) zoom = 10;
      else if (maxSpan > 0.1) zoom = 11;
      else if (maxSpan > 0.05) zoom = 12;
      else zoom = 13;

      map.setZoom(zoom);

      console.log(
        `[useAMap] 地图中心: [${centerLng.toFixed(4)}, ${centerLat.toFixed(
          4
        )}], 缩放: ${zoom}`
      );

      // 延迟执行 fitView 自动调整视野
      setTimeout(() => {
        if (mapRef.current && markersRef.current.length > 0) {
          try {
            mapRef.current.setFitView(
              markersRef.current,
              false,
              [80, 80, 80, 80]
            );
          } catch {
            console.log("[useAMap] fitView 失败，使用手动设置");
          }
        }
      }, 300);
    }
  }, []);

  /**
   * 绘制路线
   */
  const drawRoute = React.useCallback((route: RouteInfo) => {
    const AMap = AMapRef.current;
    const map = mapRef.current;
    if (!AMap || !map || !route.polyline) return;

    // 清除现有路线
    for (const polyline of polylinesRef.current) {
      polyline.setMap(null);
    }
    polylinesRef.current = [];

    // 绘制路线
    const path = route.polyline.map(
      (p) => new AMap.LngLat(p.longitude, p.latitude)
    );

    const polyline = new AMap.Polyline({
      path,
      strokeColor: "#3b82f6",
      strokeWeight: 5,
      strokeOpacity: 0.8,
      lineJoin: "round",
      lineCap: "round",
    });

    map.add(polyline);
    polylinesRef.current.push(polyline);
  }, []);

  /**
   * 清除所有标注
   */
  const clearMarkers = React.useCallback(() => {
    for (const marker of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];

    for (const polyline of polylinesRef.current) {
      polyline.setMap(null);
    }
    polylinesRef.current = [];
  }, []);

  /**
   * 设置地图中心
   */
  const setCenter = React.useCallback(
    (location: GeoLocation, zoom?: number) => {
      const map = mapRef.current;
      if (!map) return;

      map.setCenter([location.longitude, location.latitude]);
      if (zoom) {
        map.setZoom(zoom);
      }
    },
    []
  );

  /**
   * 自适应显示所有标注
   */
  const fitView = React.useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setFitView(markersRef.current);
  }, []);

  return {
    ...state,
    containerRef,
    markAttractions,
    drawRoute,
    clearMarkers,
    setCenter,
    fitView,
    resize,
  };
}
