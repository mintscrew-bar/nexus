import React from "react";

// 카카오 우편번호 서비스 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
          apartment: string;
          jibunAddress: string;
          roadAddress: string;
          zonecode: string;
        }) => void;
        onclose?: () => void;
        onresize?: (size: { width: number; height: number }) => void;
        onsearch?: (data: { q: string }) => void;
        width?: string | number;
        height?: string | number;
        animation?: boolean;
        hideMapBtn?: boolean;
        hideEngBtn?: boolean;
        pleaseReadGuide?: number;
        maxSuggestItems?: number;
        showMoreHName?: boolean;
        showMoreHNameClose?: boolean;
        showMoreHNameSameAsKeyword?: boolean;
        theme?: {
          bgColor?: string;
          searchBgColor?: string;
          contentBgColor?: string;
          pageBgColor?: string;
          textColor?: string;
          queryTextColor?: string;
          postcodeTextColor?: string;
          emphTextColor?: string;
          outlineColor?: string;
        };
      }) => {
        open: () => void;
      };
    };
  }
}

export interface AddressSearchProps {
  onComplete: (addressData: {
    address: string;
    zonecode: string;
    roadAddress: string;
    jibunAddress: string;
  }) => void;
  className?: string;
  children?: React.ReactNode;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  onComplete,
  className = "",
  children = "주소 검색",
}) => {
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        // 도로명 주소의 노출 규칙에 따라 주소를 표시합니다.
        // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
        let roadAddr = data.roadAddress; // 도로명 주소 변수
        let jibunAddr = data.jibunAddress; // 지번 주소 변수

        // 우선순위: 도로명 주소 > 지번 주소
        let finalAddress = roadAddr || jibunAddr;

        onComplete({
          address: finalAddress,
          zonecode: data.zonecode,
          roadAddress: roadAddr,
          jibunAddress: jibunAddr,
        });
      },
      onclose: function (state) {
        // state는 우편번호 찾기 화면이 어떻게 닫혔는지에 대한 상태
        // state는 'FORCE_CLOSE' 또는 'COMPLETE_CLOSE' 또는 'COMPLETE_CLOSE' 중 하나
        if (state === "FORCE_CLOSE") {
          // 사용자가 브라우저 메뉴를 통해 팝업을 닫은 경우
        } else if (state === "COMPLETE_CLOSE") {
          // 검색결과를 선택하여 팝업이 닫힌 경우
        }
      },
      width: "100%",
      height: "100%",
      animation: true,
      theme: {
        bgColor: "#ffffff",
        searchBgColor: "#f8f9fa",
        contentBgColor: "#ffffff",
        pageBgColor: "#ffffff",
        textColor: "#333333",
        queryTextColor: "#222222",
        postcodeTextColor: "#fa4256",
        emphTextColor: "#fa4256",
        outlineColor: "#e0e0e0",
      },
    }).open();
  };

  return (
    <button
      type="button"
      onClick={openPostcode}
      className={`address-search-btn ${className}`}
    >
      {children}
    </button>
  );
};

export default AddressSearch;
