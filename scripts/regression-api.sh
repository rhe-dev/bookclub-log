#!/bin/sh
#
# QA.md §F — 도커 기동 후 서버 계약을 화면 없이 훑는다.
#
#   docker compose up --build   # 클린 기동
#   sh scripts/regression-api.sh
#
# 주문 상태를 실제로 바꾸므로, 화면 QA 전에 돌렸다면
# `docker compose down -v && docker compose up -d`로 시드를 되돌린다.
# 포트를 바꿔 띄웠다면 아래 두 줄을 그에 맞춘다.
API=${API:-http://localhost:4000/api}
WEB=${WEB:-http://localhost:3000}
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); printf "  ✓ %s\n" "$1"; }
bad()  { FAIL=$((FAIL+1)); printf "  ✗ %s — %s\n" "$1" "$2"; }

expect_code() { # 라벨 기대코드 응답본문
  got=$(printf '%s' "$3" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const r=JSON.parse(d);console.log(r.errors?r.errors.map(e=>e.code).join(','):('OK:'+(r.status||'')))}catch(e){console.log('PARSE_FAIL')}})")
  case "$got" in *"$2"*) ok "$1 ($got)";; *) bad "$1" "기대 $2 / 실제 $got";; esac
}

echo "── 라우트 응답"
for p in / /bookshelf /my /orders/new /admin/orders /admin/members /admin/clubs; do
  c=$(curl -s -o /dev/null -w "%{http_code}" $WEB$p)
  [ "$c" = "200" ] && ok "$p 200" || bad "$p" "$c"
done
c=$(curl -s -o /dev/null -w "%{http_code}" $WEB/admin); [ "$c" = "307" ] && ok "/admin 307 리다이렉트" || bad "/admin" "$c"

echo
echo "── 전송·캐시"
curl -s -D - -o /dev/null -H "Accept-Encoding: gzip" $WEB/ | grep -qi "content-encoding: gzip" && ok "HTML gzip" || bad "HTML gzip" "헤더 없음"
CHUNK=$(curl -s $WEB/ | grep -oE '/_next/static/chunks/[^"]+\.js' | head -1)
curl -s -D - -o /dev/null -H "Accept-Encoding: gzip" $WEB$CHUNK | grep -qi "content-encoding: gzip" && ok "청크 gzip" || bad "청크 gzip" "헤더 없음"
curl -s -D - -o /dev/null $WEB$CHUNK | grep -qi "immutable" && ok "청크 immutable 캐시" || bad "청크 캐시" "immutable 없음"

echo
echo "── 지연 로딩(D-041)"
HIT=""
for c in $(curl -s $WEB/ | grep -oE '/_next/static/chunks/[^"]+\.js' | sort -u); do
  h=$(curl -s -H "Accept-Encoding: identity" $WEB$c | grep -oE 'MuiDialog|MuiTabs|MuiPopover' | sort -u | tr '\n' ' ')
  [ -n "$h" ] && HIT="$HIT $c:$h"
done
[ -z "$HIT" ] && ok "랜딩 초기 청크에 Dialog·Tabs·Popover 없음" || bad "랜딩 초기 청크" "$HIT"

echo
echo "── 잘못된 경로·없는 대상"
curl -s -o /dev/null -w "%{http_code}" $WEB/nope | grep -q 404 && ok "없는 경로 404 응답" || bad "없는 경로" "404가 아님"
NOTFOUND_HTML=$(curl -s $WEB/nope)
printf '%s' "$NOTFOUND_HTML" | grep -q "찾을 수 없는 페이지" && ok "404 화면이 한국어 공통 페이지" || bad "404 화면" "기본 영문 페이지"
printf '%s' "$NOTFOUND_HTML" | grep -q "북클럽 로그" && ok "404에도 GNB·푸터 유지" || bad "404 레이아웃" "헤더 없음"
# 경로는 맞지만 대상이 없는 경우 — 화면이 도메인 문구로 갈라내려면 404여야 한다
MEMBER_ID=$(curl -s $API/members | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d)[0].publicId))")
for p in "books/nope-id" "admin/orders/nope-id" "admin/members/nope-id" "admin/clubs/nope-id"; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Member-Id: $MEMBER_ID" "$API/$p")
  [ "$c" = "404" ] && ok "$p → 404" || bad "$p" "$c"
done

echo
echo "── 에러 계약"
expect_code "없는 API 경로 → NOT_FOUND" "NOT_FOUND" "$(curl -s $API/nope)"
expect_code "헤더 누락 → MEMBER_HEADER_REQUIRED" "MEMBER_HEADER_REQUIRED" "$(curl -s $API/orders/mine)"
expect_code "잘못된 쿼리 값 → PAGE_INVALID" "PAGE_INVALID" "$(curl -s "$API/admin/orders?page=abc")"

echo
echo "── 주문 전이"
INFO=$(curl -s "$API/admin/orders?page=1&limit=50" | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);
const del=r.items.filter(o=>o.status==='DELIVERED');const rec=r.items.find(o=>o.status==='RECEIVED');const conf=r.items.find(o=>o.status==='CONFIRMED');const can=r.items.find(o=>o.status==='CANCELED');
console.log(del[0].publicId,del[1].publicId,rec.publicId,conf.publicId,can.publicId)})")
D1=$(echo "$INFO"|cut -d' ' -f1); D2=$(echo "$INFO"|cut -d' ' -f2); REC=$(echo "$INFO"|cut -d' ' -f3); CONF=$(echo "$INFO"|cut -d' ' -f4); CAN=$(echo "$INFO"|cut -d' ' -f5)
OWNER=$(curl -s "$API/admin/orders/$D1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);console.log((r.member||r.orderer||{}).publicId||'')})")
OTHER=$(curl -s "$API/members" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const m=JSON.parse(d);console.log(m.find(x=>x.publicId!=='$OWNER').publicId)})")

t()  { curl -s -X POST "$API/orders/$1/transition" -H "Content-Type: application/json" -H "X-Member-Id: $2" -d "$3"; }
at() { curl -s -X POST "$API/admin/orders/$1/transition" -H "Content-Type: application/json" -d "$2"; }

expect_code "주문자 아님 거부"        "ORDER_ORDERER_ONLY"          "$(t $D1 $OTHER '{"toStatus":"PURCHASE_CONFIRMED"}')"
expect_code "사유 누락 거부"          "ORDER_REASON_REQUIRED"       "$(t $D1 $OWNER '{"toStatus":"REFUND_REQUESTED"}')"
expect_code "기타 상세 누락 거부"      "ORDER_REASON_DETAIL_REQUIRED" "$(t $D1 $OWNER '{"toStatus":"REFUND_REQUESTED","reason":"OTHER"}')"
expect_code "정상 환불요청"           "OK:REFUND_REQUESTED"         "$(t $D1 $OWNER '{"toStatus":"REFUND_REQUESTED","reason":"PRINT_DEFECT","reasonDetail":"12쪽 인쇄가 번졌습니다."}')"
expect_code "중복 요청 거부"          "ORDER_INVALID_TRANSITION"    "$(t $D1 $OWNER '{"toStatus":"REFUND_REQUESTED","reason":"PRINT_DEFECT","reasonDetail":"12쪽 인쇄가 번졌습니다."}')"
expect_code "관리자 환불 완료"        "OK:REFUNDED"                 "$(at $D1 '{"toStatus":"REFUNDED"}')"
expect_code "종결 후 전이 거부"        "ORDER_INVALID_TRANSITION"    "$(t $D1 $OWNER '{"toStatus":"PURCHASE_CONFIRMED"}')"
expect_code "관리자가 구매확정 시도 거부" "ORDER_ORDERER_ONLY"        "$(at $D2 '{"toStatus":"PURCHASE_CONFIRMED"}')"
expect_code "단계 건너뛰기 거부"       "ORDER_INVALID_TRANSITION"    "$(at $REC '{"toStatus":"SHIPPED"}')"
expect_code "정상 순방향(접수→확인)"    "OK:CONFIRMED"                "$(at $REC '{"toStatus":"CONFIRMED"}')"
expect_code "역행 거부"               "ORDER_INVALID_TRANSITION"    "$(at $REC '{"toStatus":"RECEIVED"}')"

echo
echo "── 북프린트 발주·웹훅"
expect_code "취소 건 발주 거부"        "ORDER_INVALID_TRANSITION"    "$(curl -s -X POST "$API/admin/orders/$CAN/production" -H 'Content-Type: application/json' -d '{}')"
expect_code "확인 상태 발주"           "OK:IN_PRODUCTION"            "$(curl -s -X POST "$API/admin/orders/$CONF/production" -H 'Content-Type: application/json' -d '{}')"
expect_code "중복 발주 거부"           "PRINT_ALREADY_ORDERED"       "$(curl -s -X POST "$API/admin/orders/$CONF/production" -H 'Content-Type: application/json' -d '{}')"
ve() { curl -s -X POST "$API/admin/orders/$1/vendor-events" -H "Content-Type: application/json" -d "{\"event\":\"$2\"}"; }
expect_code "웹훅 production.confirmed(주문상태 유지)" "OK:IN_PRODUCTION" "$(ve $CONF production.confirmed)"
expect_code "웹훅 production.started(주문상태 유지)"   "OK:IN_PRODUCTION" "$(ve $CONF production.started)"
expect_code "웹훅 production.completed"               "OK:PRODUCED"      "$(ve $CONF production.completed)"
expect_code "웹훅 shipping.departed"                  "OK:SHIPPED"       "$(ve $CONF shipping.departed)"
expect_code "웹훅 shipping.delivered"                 "OK:DELIVERED"     "$(ve $CONF shipping.delivered)"
expect_code "미발주 건 이벤트 거부"                     "PRINT_NOT_ORDERED" "$(ve $REC production.started)"
expect_code "알 수 없는 이벤트 거부"                    "PRINT_WEBHOOK_EVENT_INVALID" "$(ve $CONF nope.whatever)"

TRACK=$(curl -s "$API/admin/orders/$CONF/production" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);console.log(r.trackingNumber||'')})")
[ -n "$TRACK" ] && ok "송장 발급됨 ($TRACK)" || bad "송장" "없음"

echo
echo "════════ 통과 $PASS / 실패 $FAIL ════════"
