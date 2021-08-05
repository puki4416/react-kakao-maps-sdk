import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface MarkerProps {
  map: kakao.maps.Map | kakao.maps.Roadview;
  position: kakao.maps.LatLng | kakao.maps.Viewpoint;
  options?: {
    /**
     * 마커의 이미지
     */
    image?: kakao.maps.MarkerImage;

    /**
     * 마커 엘리먼트의 타이틀 속성 값 (툴팁)
     */
    title?: string;

    /**
     * 드래그 가능한 마커, 로드뷰에 올릴 경우에는 유효하지 않다.
     */
    draggable?: boolean;

    /**
     * dragstart 이벤트 핸들러
     */
    onDragStart?: () => void;

    /**
     * dragend 이벤트 핸들러
     */
    onDragEnd?: () => void;

    /**
     * 클릭 가능한 마커
     */
    clickable?: boolean;

    /**
     * click 이벤트 핸들러
     */
    onClick?: () => void;

    /**
     * mouseover 이벤트 핸들러
     */
    onMouseOver?: () => void;

    /**
     * mouseout 이벤트 핸들러
     */
    onMouseOut?: () => void;

    /**
     * 마커 엘리먼트의 z-index 속성 값
     */
    zIndex?: number;

    /**
     * 마커 투명도 (0-1)
     */
    opacity?: number;

    /**
     * 로드뷰에 올라있는 마커의 높이 값(m 단위)
     */
    altitude?: number;

    /**
     * 로드뷰 상에서 마커의 가시반경(m 단위), 두 지점 사이의 거리가 지정한 값보다 멀어지면 마커는 로드뷰에서 보이지 않게 된다.
     */
    range?: number;

    /**
     * InfoWindow 옵션
     */
    infoWindowOptions?: {
      /**
       * 인포윈도우를 열 때 지도가 자동으로 패닝하지 않을지의 여부 (기본값: false)
       */
      disableAutoPan?: boolean;

      /**
       * 삭제 가능한 인포윈도우
       */
      removable?: boolean;

      /**
       * 인포윈도우 엘리먼트의 z-index 속성 값
       */
      zIndex?: number;

      /**
       * 로드뷰에 올라있는 인포윈도우의 높이 값(m 단위)
       */
      altitude?: number;

      /**
       * 로드뷰 상에서 인포윈도우의 가시반경(m 단위), 두 지점 사이의 거리가 지정한 값보다 멀어지면 인포윈도우는 보이지 않게 된다
       */
      range?: number;
    };
  };
}

const Marker: React.FC<MarkerProps> = ({
  map,
  position,
  children,
  options,
}) => {
  const [marker, setMarker] = useState<kakao.maps.Marker>();

  const infoContainer = useRef(document.createElement("div"));

  useEffect(() => {
    if (!map) return;

    const kakaoMarker = new kakao.maps.Marker({
      ...options,
      map: map,
      position: position,
    });

    setMarker(kakaoMarker);

    return () => {
      kakaoMarker.setMap(null);
    };
  }, [map, position, options]);

  useEffect(() => {
    if (!map || !marker) return;

    if (options?.draggable) {
      if (options?.onDragStart)
        kakao.maps.event.addListener(marker, "dragstart", options.onDragStart);
      if (options?.onDragEnd)
        kakao.maps.event.addListener(marker, "dragend", options.onDragEnd);
    }

    if (options?.clickable && options?.onClick)
      kakao.maps.event.addListener(marker, "click", options.onClick);

    if (options?.onMouseOver)
      kakao.maps.event.addListener(marker, "mouseover", options?.onMouseOver);
    if (options?.onMouseOut)
      kakao.maps.event.addListener(marker, "mouseout", options?.onMouseOut);

    return () => {
      if (options?.draggable) {
        if (options?.onDragStart)
          kakao.maps.event.removeListener(
            marker,
            "dragstart",
            options.onDragStart
          );
        if (options?.onDragEnd)
          kakao.maps.event.removeListener(marker, "dragend", options.onDragEnd);
      }

      if (options?.clickable && options?.onClick)
        kakao.maps.event.removeListener(marker, "click", options.onClick);

      if (options?.onMouseOver)
        kakao.maps.event.removeListener(
          marker,
          "mouseover",
          options?.onMouseOver
        );
      if (options?.onMouseOut)
        kakao.maps.event.removeListener(
          marker,
          "mouseout",
          options?.onMouseOut
        );
    };
  }, [
    map,
    marker,
    options?.draggable,
    options?.onDragStart,
    options?.onDragEnd,
    options?.clickable,
    options?.onClick,
    options?.onMouseOver,
    options?.onMouseOut,
  ]);

  useEffect(() => {
    if (!marker || !map || !children) return;

    const kakaoInfoWindow = new kakao.maps.InfoWindow({
      ...options?.infoWindowOptions,
      content: infoContainer.current,
      position: position,
    });

    kakaoInfoWindow.open(map, marker);

    return () => {
      kakaoInfoWindow.close();
    };
  }, [marker, map, position, children, options?.infoWindowOptions]);

  return ReactDOM.createPortal(children, infoContainer.current);
};

export default Marker;
