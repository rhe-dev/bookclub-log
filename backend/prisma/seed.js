// 시드: 모임 2(멀티 클럽 시연 — 서지원·김민준이 두 클럽에 가입, 역할이 다름), 회원 8,
// 책 15(읽는 중 2·예정 1·완독 12), 코멘트·답글 46, 주문 5(4권 수록·타 클럽 주문 포함)
// 컨테이너 기동 시 자동 실행되므로 멱등해야 한다 — 데이터가 있으면 건너뜀
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const kst = (s) => new Date(`${s}+09:00`);

const MEMBERS = [
  { key: 'jiwon', name: '서지원', avatarEmoji: '🦉', color: '#6D5ACF', role: 'LEADER' },
  { key: 'minjun', name: '김민준', avatarEmoji: '🐳', color: '#3E8ED0', role: 'MEMBER' },
  { key: 'seoyeon', name: '이서연', avatarEmoji: '🌷', color: '#E26D8F', role: 'MEMBER' },
  { key: 'haneul', name: '박하늘', avatarEmoji: '☁️', color: '#58B99D', role: 'MEMBER' },
  { key: 'doyun', name: '최도윤', avatarEmoji: '🦊', color: '#E8853D', role: 'MEMBER' },
  { key: 'eunchae', name: '정은채', avatarEmoji: '🌙', color: '#8B6F4E', role: 'MEMBER' },
];

// 두 번째 클럽 멤버십 — jiwon·minjun은 기존 멤버 재사용(멀티 클럽 회원), 여기서는 일반 멤버
const MEMBERS2 = [
  { key: 'seojun', name: '한서준', avatarEmoji: '🐢', color: '#3D7A68', role: 'LEADER' },
  { key: 'yujin', name: '오유진', avatarEmoji: '🍀', color: '#6FA84C', role: 'MEMBER' },
  { key: 'jiwon', role: 'MEMBER' },
  { key: 'minjun', role: 'MEMBER' },
];

const BOOKS = [
  {
    key: 'fish',
    title: '물고기는 존재하지 않는다',
    author: '룰루 밀러',
    publisher: '곰출판',
    coverColor: '#1F6E8C',
    coverEmoji: '🐟',
    status: 'READING',
    periodFrom: '2026-07-13T00:00:00',
    periodTo: '2026-08-09T00:00:00',
    meetingDate: '2026-08-09T20:00:00',
    participants: ['jiwon', 'minjun', 'seoyeon', 'haneul', 'doyun', 'eunchae'],
  },
  {
    key: 'boy',
    title: '소년이 온다',
    author: '한강',
    publisher: '창비',
    coverColor: '#44506B',
    coverEmoji: '🕯️',
    status: 'UPCOMING',
    periodFrom: '2026-08-10T00:00:00',
    periodTo: '2026-09-06T00:00:00',
    meetingDate: '2026-09-06T20:00:00',
    participants: ['jiwon', 'seoyeon', 'haneul', 'eunchae'],
  },
  {
    key: 'store',
    title: '불편한 편의점',
    author: '김호연',
    publisher: '나무옆의자',
    coverColor: '#F2B33D',
    coverEmoji: '🏪',
    status: 'DONE',
    periodFrom: '2026-06-15T00:00:00',
    periodTo: '2026-07-12T00:00:00',
    meetingDate: '2026-07-12T20:00:00',
    participants: ['jiwon', 'minjun', 'seoyeon', 'haneul', 'doyun', 'eunchae'],
  },
  {
    key: 'almond',
    title: '아몬드',
    author: '손원평',
    publisher: '창비',
    coverColor: '#7BAE7F',
    coverEmoji: '🌰',
    status: 'DONE',
    periodFrom: '2026-05-18T00:00:00',
    periodTo: '2026-06-14T00:00:00',
    meetingDate: '2026-06-14T20:00:00',
    participants: ['jiwon', 'minjun', 'seoyeon', 'haneul', 'doyun', 'eunchae'],
  },
  {
    key: 'library',
    title: '미드나잇 라이브러리',
    author: '매트 헤이그',
    publisher: '인플루엔셜',
    coverColor: '#2E3A59',
    coverEmoji: '🌌',
    status: 'DONE',
    periodFrom: '2026-04-20T00:00:00',
    periodTo: '2026-05-17T00:00:00',
    meetingDate: '2026-05-17T20:00:00',
    participants: ['jiwon', 'minjun', 'haneul', 'doyun', 'eunchae'],
  },
  {
    key: 'pachinko',
    title: '파친코 1',
    author: '이민진',
    publisher: '인플루엔셜',
    coverColor: '#A63D40',
    coverEmoji: '🧳',
    status: 'DONE',
    periodFrom: '2026-03-23T00:00:00',
    periodTo: '2026-04-19T00:00:00',
    meetingDate: '2026-04-19T20:00:00',
    participants: ['jiwon', 'minjun', 'seoyeon', 'eunchae'],
  },

  // 지난 완독 기록(2025-08~2026-03) — 책방 '더보기' 페이지네이션(12권 초과) 시연용
  { key: 'dallergut', title: '달러구트 꿈 백화점', author: '이미예', publisher: '팩토리나인', coverColor: '#7E6BC4', coverEmoji: '🌠', status: 'DONE', periodFrom: '2025-12-22T00:00:00', periodTo: '2026-01-18T00:00:00', meetingDate: '2026-01-18T20:00:00', participants: ['jiwon', 'minjun', 'seoyeon', 'haneul'] },
  { key: 'hyunam', title: '어서 오세요, 휴남동 서점입니다', author: '황보름', publisher: '클레이하우스', coverColor: '#5E8B6B', coverEmoji: '🌿', status: 'DONE', periodFrom: '2026-01-19T00:00:00', periodTo: '2026-02-22T00:00:00', meetingDate: '2026-02-22T20:00:00', participants: ['jiwon', 'seoyeon', 'haneul', 'doyun', 'eunchae'] },
  { key: 'farewell', title: '작별인사', author: '김영하', publisher: '복복서가', coverColor: '#3C4F76', coverEmoji: '🤖', status: 'DONE', periodFrom: '2025-10-27T00:00:00', periodTo: '2025-11-23T00:00:00', meetingDate: '2025-11-23T20:00:00', participants: ['jiwon', 'minjun', 'doyun', 'eunchae'] },
  { key: 'pagwa', title: '파과', author: '구병모', publisher: '자음과모음', coverColor: '#8A4B53', coverEmoji: '🌹', status: 'DONE', periodFrom: '2025-09-29T00:00:00', periodTo: '2025-10-26T00:00:00', meetingDate: '2025-10-26T20:00:00', participants: ['jiwon', 'seoyeon', 'haneul', 'eunchae'] },
  { key: 'longnight', title: '긴긴밤', author: '루리', publisher: '문학동네', coverColor: '#41698C', coverEmoji: '🐧', status: 'DONE', periodFrom: '2025-09-01T00:00:00', periodTo: '2025-09-28T00:00:00', meetingDate: '2025-09-28T20:00:00', participants: ['jiwon', 'minjun', 'seoyeon', 'haneul', 'doyun', 'eunchae'] },
  { key: 'smallthings', title: '이처럼 사소한 것들', author: '클레어 키건', publisher: '다산책방', coverColor: '#6E7F5C', coverEmoji: '❄️', status: 'DONE', periodFrom: '2025-11-24T00:00:00', periodTo: '2025-12-21T00:00:00', meetingDate: '2025-12-21T20:00:00', participants: ['jiwon', 'minjun', 'haneul'] },
  { key: 'bluehorse', title: '천 개의 파랑', author: '천선란', publisher: '허블', coverColor: '#2E6E8E', coverEmoji: '🐎', status: 'DONE', periodFrom: '2025-08-04T00:00:00', periodTo: '2025-08-31T00:00:00', meetingDate: '2025-08-31T20:00:00', participants: ['jiwon', 'minjun', 'seoyeon', 'doyun'] },
];

const BOOKS2 = [
  {
    key: 'summer',
    title: '바깥은 여름',
    author: '김애란',
    publisher: '문학동네',
    coverColor: '#4C9A6E',
    coverEmoji: '🌿',
    status: 'READING',
    periodFrom: '2026-07-06T00:00:00',
    periodTo: '2026-08-02T00:00:00',
    meetingDate: '2026-08-02T14:00:00',
    participants: ['seojun', 'yujin', 'jiwon', 'minjun'],
  },
  {
    key: 'shoko',
    title: '쇼코의 미소',
    author: '최은영',
    publisher: '문학동네',
    coverColor: '#6B8CAE',
    coverEmoji: '💌',
    status: 'DONE',
    periodFrom: '2026-05-04T00:00:00',
    periodTo: '2026-05-31T00:00:00',
    meetingDate: '2026-05-31T14:00:00',
    participants: ['seojun', 'yujin', 'jiwon'],
  },
];

// key: 답글이 참조할 식별자 / parent: 부모 코멘트 key / editedAt: 수정됨 표시용 / deletedAt: 소프트 딜리트
const COMMENTS = [
  // 물고기는 존재하지 않는다 (읽는 중 — 토론 진행형)
  { key: 'c1', book: 'fish', by: 'jiwon', page: 29, quote: '혼돈이 세계의 기본값이라면, 질서는 언제나 잠깐의 예외다', content: '초반부터 이 문장에 밑줄 그었어요. 혼돈에 맞서 평생을 바쳤다는 데이비드 스타 조던 소개가 뒤에서 어떻게 뒤집힐지 궁금해지네요.', at: '2026-07-14T21:03:00' },
  { key: 'c2', book: 'fish', by: 'minjun', parent: 'c1', content: '저도 여기 접어뒀어요. 과학 논픽션인 줄 알았는데 에세이처럼 읽혀서 놀라는 중입니다.', at: '2026-07-15T08:12:00' },
  { key: 'c3', book: 'fish', by: 'seoyeon', page: 85, content: '표본 라벨을 바늘로 꿰매는 장면, 집착이 무섭기도 하고 뭉클하기도 해요. 다들 여기까지 읽으셨나요?', at: '2026-07-16T22:40:00' },
  { key: 'c4', book: 'fish', by: 'haneul', parent: 'c3', content: '어제 딱 그 장면 읽었어요! 지진으로 다 무너진 다음이라 더 처절하게 느껴졌어요.', at: '2026-07-17T07:55:00' },
  { key: 'c5', book: 'fish', by: 'doyun', parent: 'c3', content: '스포 조심스럽지만… 그 집착의 결이 후반부에 완전히 다르게 보입니다. 끝까지 가봅시다.', at: '2026-07-17T23:10:00' },
  { key: 'c6', book: 'fish', by: 'eunchae', quote: '무질서 속에서도 계속 나아가는 것', content: '제목이 왜 이렇게 지어졌는지 중반쯤 오니까 감이 와요. 어류라는 분류 자체를 의심하게 될 줄은 몰랐네요.', at: '2026-07-19T14:20:00' },
  { key: 'c7', book: 'fish', by: 'minjun', page: 152, content: '우생학 이야기가 나오면서 분위기가 확 바뀌는데, 위인전이라고 생각하고 읽던 제가 부끄러워졌어요.', at: '2026-07-21T20:31:00' },
  { key: 'c8', book: 'fish', by: 'jiwon', parent: 'c7', content: "그 반전이 이 책의 핵심 같아요. 모임 때 '영웅 서사를 의심하는 법'을 주제로 이야기해보면 좋겠습니다.", at: '2026-07-21T21:02:00' },
  { key: 'c9', book: 'fish', by: 'haneul', content: '다음 모임(8/9)까지 완독이 목표인데, 3부부터 속도가 확 붙네요. 다들 화이팅!', at: '2026-07-23T12:44:00' },
  { key: 'c10', book: 'fish', by: 'seoyeon', parent: 'c9', content: '저 오늘 밤샘각입니다 🙃', at: '2026-07-23T13:01:00' },
  { key: 'c11', book: 'fish', by: 'doyun', page: 210, quote: '물고기는 존재하지 않는다', content: '드디어 제목 문장을 만났습니다. 여기서부터는 아무 말도 못 하겠어요. 모임에서 봬요.', at: '2026-07-25T23:18:00' },
  { key: 'c12', book: 'fish', by: 'eunchae', parent: 'c11', content: '저만 어제 다 읽고 멍하니 있었던 게 아니군요…', at: '2026-07-26T09:15:00' },

  // 불편한 편의점 (완료)
  { key: 'c13', book: 'store', by: 'minjun', page: 42, content: '독고 씨 말투가 처음엔 답답했는데 곱씹을수록 정이 가요. 옥수수수염차 같은 사람.', at: '2026-06-18T19:22:00' },
  { key: 'c14', book: 'store', by: 'eunchae', parent: 'c13', content: '비유 무엇 ㅋㅋㅋ 근데 정확해서 반박을 못 하겠네요.', at: '2026-06-19T08:40:00' },
  { key: 'c15', book: 'store', by: 'seoyeon', quote: '손님이 오면 인사를 하고, 가면 또 인사를 한다', content: '편의점이라는 공간이 이렇게 따뜻하게 그려질 수 있다는 게 신기했어요.', at: '2026-06-24T21:15:00' },
  { key: 'c16', book: 'store', by: 'jiwon', page: 198, content: '각 챕터가 다른 인물 시점으로 진행되는 구성, 옴니버스 같으면서도 하나로 모이는 게 좋았습니다.', at: '2026-06-30T22:05:00' },
  { key: 'c17', book: 'store', by: 'haneul', parent: 'c16', content: '저는 경만 아저씨 챕터에서 울컥했어요. 가족한테 말 못 하는 마음이 너무 현실적이라.', at: '2026-07-01T07:30:00' },
  { key: 'c18', book: 'store', by: 'doyun', content: '모임 전 마지막 감상 남깁니다. 결말이 조금 순하게 느껴졌지만, 요즘 같은 때 이런 순한 맛이 필요한 것 같기도 해요.', at: '2026-07-10T20:50:00' },
  { key: 'c19', book: 'store', by: 'minjun', parent: 'c18', content: "동의해요. '착한 이야기'가 촌스럽지 않게 착하기가 얼마나 어려운데요.", at: '2026-07-11T09:12:00' },
  { key: 'c20', book: 'store', by: 'jiwon', content: '오늘 모임 다들 수고하셨어요! 독고 씨의 정체를 두고 예측이 다 달랐던 게 재밌었네요. 다음 책은 『물고기는 존재하지 않는다』입니다.', at: '2026-07-12T21:40:00' },
  { key: 'c21', book: 'store', by: 'seoyeon', parent: 'c20', content: '오늘도 시간 순삭이었어요. 다음 책도 기대!', at: '2026-07-12T22:03:00' },

  // 아몬드 (완료 — 소프트 딜리트·수정 사례 포함)
  { key: 'c22', book: 'almond', by: 'haneul', page: 17, quote: '감정이라는 단어를 사전에서 배웠다', content: '윤재의 시점 묘사가 담담해서 오히려 더 아프네요. 초반부터 몰입했습니다.', at: '2026-05-21T20:10:00' },
  { key: 'c23', book: 'almond', by: 'seoyeon', parent: 'c22', content: '저도요. 담담한 문장이 이 소설의 최고 장치 같아요.', at: '2026-05-22T08:25:00' },
  { key: 'c24', book: 'almond', by: 'doyun', page: 121, content: '곤이가 등장하면서 이야기가 확 살아나요. 둘의 관계가 어디로 갈지 조마조마합니다.', at: '2026-05-27T21:33:00' },
  { key: 'c25', book: 'almond', by: 'eunchae', content: '결말 이야기인데, 마지막에 곤이가 윤재를 찾아오는 장면에서 결국 두 사람이…', at: '2026-05-29T19:44:00', deletedAt: '2026-05-29T20:10:00' },
  { key: 'c26', book: 'almond', by: 'minjun', parent: 'c25', content: '앗 저 아직 거기까지 못 읽었어요 😭 스포 주의 부탁드려요!', at: '2026-05-29T20:01:00' },
  { key: 'c27', book: 'almond', by: 'eunchae', parent: 'c25', content: '죄송해요, 위 코멘트는 지웠습니다! 다 읽고 다시 이야기해요.', at: '2026-05-29T20:12:00' },
  { key: 'c28', book: 'almond', by: 'jiwon', quote: '멀리 있는 불행보다 가까운 불행이 더 아프다', content: '이 문장을 두고 모임에서 꼭 이야기해보고 싶어요. 공감의 반경이라는 게 결국 훈련되는 걸까요?', at: '2026-06-05T22:20:00', editedAt: '2026-06-06T09:15:00' },
  { key: 'c29', book: 'almond', by: 'haneul', parent: 'c28', content: '훈련된다에 한 표. 윤재의 변화 자체가 그 증거 아닐까요.', at: '2026-06-06T21:47:00' },
  { key: 'c30', book: 'almond', by: 'seoyeon', content: "모임 후기: '감정을 배운다'는 게 가능한가를 두고 1시간 넘게 이야기한 거 최고였어요.", at: '2026-06-14T21:30:00' },

  // 미드나잇 라이브러리 (완료)
  { key: 'c31', book: 'library', by: 'eunchae', page: 55, content: '후회의 책 설정이 흥미로워요. 나라면 어떤 삶부터 펼쳐볼까 생각하게 되네요.', at: '2026-04-26T21:00:00' },
  { key: 'c32', book: 'library', by: 'minjun', parent: 'c31', content: '저는 밴드를 계속했다면… 이라는 삶이요. 다들 하나씩은 있잖아요.', at: '2026-04-27T08:30:00' },
  { key: 'c33', book: 'library', by: 'jiwon', quote: '산다는 것은 결코 완주가 아니라 계속되는 선택이다', content: '중반의 반복 구조가 살짝 늘어지지만, 이 문장으로 다 용서됩니다.', at: '2026-05-08T22:15:00' },
  { key: 'c34', book: 'library', by: 'haneul', content: "모임에서 나온 '후회는 데이터다'라는 말이 계속 남네요. 다음 책 『아몬드』도 기대됩니다.", at: '2026-05-17T21:10:00' },
  { key: 'c35', book: 'library', by: 'doyun', parent: 'c34', content: '그 말 하신 분 접니다 ㅎㅎ 오늘 즐거웠어요.', at: '2026-05-17T21:40:00' },

  // 파친코 1 (완료)
  { key: 'c36', book: 'pachinko', by: 'jiwon', page: 11, quote: '역사가 우리를 망쳐 놨지만 그래도 상관없다', content: '첫 문장부터 압도적이네요. 이번 달은 분량이 있으니 일정 관리 잘 해봐요.', at: '2026-03-28T20:40:00' },
  { key: 'c37', book: 'pachinko', by: 'seoyeon', content: '선자가 부산을 떠나는 장면에서 한참 멈춰 있었어요. 담담해서 더 슬픈 문장들.', at: '2026-04-10T22:25:00' },
  { key: 'c38', book: 'pachinko', by: 'eunchae', parent: 'c37', content: '저도 그 장면 접어뒀어요. 2권도 언젠가 같이 읽어요.', at: '2026-04-11T09:05:00' },

  // ── 밑줄과 여백 (두 번째 클럽) ──
  { key: 'c39', book: 'shoko', by: 'seojun', page: 33, content: '쇼코의 편지들이 담담해서 오히려 오래 남네요. 편지라는 형식 자체가 이 소설의 온도 같아요.', at: '2026-05-12T21:20:00' },
  { key: 'c40', book: 'shoko', by: 'jiwon', parent: 'c39', content: '두 모임을 병행하며 읽는 첫 책인데, 단편이라 호흡이 좋아요. 저는 마지막 문장에서 한참 멈췄습니다.', at: '2026-05-13T08:40:00' },
  { key: 'c41', book: 'shoko', by: 'yujin', quote: '씬짜오, 씬짜오', content: '표제작만큼 「씬짜오, 씬짜오」도 꼭 이야기해보고 싶어요. 사과에 대한 소설이기도 한 것 같아서.', at: '2026-05-24T22:05:00' },
  { key: 'c42', book: 'summer', by: 'seojun', content: '첫 단편부터 여름 공기가 훅 들어오네요. 8/2 모임까지 격주로 두 편씩 읽어요.', at: '2026-07-08T20:30:00' },

  // 서지원 추가 코멘트 — 마이페이지 '내 코멘트' 페이지네이션(10개 초과) 시연용
  { key: 'c43', book: 'fish', by: 'jiwon', page: 178, content: '3부에 들어서면서 완전히 다른 책이 됐어요. 다들 어디까지 오셨나요?', at: '2026-07-24T21:10:00' },
  { key: 'c44', book: 'almond', by: 'jiwon', content: '문집 준비하며 재독 중인데, 곤이의 대사가 처음 읽을 때와 완전히 다르게 읽히네요.', at: '2026-06-10T22:00:00' },
  { key: 'c45', book: 'library', by: 'jiwon', page: 302, content: '후회의 도서관이 결국 자기 용서의 공간이었다는 게 이 책의 답 같습니다.', at: '2026-05-12T21:30:00' },
  { key: 'c46', book: 'shoko', by: 'jiwon', quote: '쇼코는 오랫동안 나에게 어둡고 좁은 통로였다', content: '두 번째 모임을 준비하며 다시 훑는데, 편지 형식이 만드는 거리감이 이 소설의 핵심 같아요.', at: '2026-05-28T20:15:00' },
];

async function main() {
  if ((await prisma.club.count()) > 0) {
    console.log('[seed] 데이터가 이미 있어 시드를 건너뜁니다.');
    return;
  }

  const club = await prisma.club.create({
    data: {
      name: '페이지 너머',
      description: '한 달에 한 권, 함께 읽고 밑줄과 생각을 나누는 온라인 독서모임',
      inviteCode: 'PAGE-2026',
      createdAt: kst('2026-03-20T10:00:00'),
    },
  });

  const club2 = await prisma.club.create({
    data: {
      name: '밑줄과 여백',
      description: '격주에 한 번, 에세이와 단편을 짧고 깊게 읽는 소모임',
      inviteCode: 'LINE-2026',
      createdAt: kst('2026-04-12T10:00:00'),
    },
  });

  const members = {};
  for (const { key, role, ...data } of MEMBERS) {
    members[key] = await prisma.member.create({ data });
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        memberId: members[key].id,
        role,
        joinedAt: kst('2026-03-20T10:30:00'),
      },
    });
  }
  // 두 번째 클럽 — 기존 멤버(jiwon)는 사람을 재사용하고 멤버십만 추가
  for (const { key, role, ...data } of MEMBERS2) {
    if (!members[key]) members[key] = await prisma.member.create({ data });
    await prisma.clubMember.create({
      data: {
        clubId: club2.id,
        memberId: members[key].id,
        role,
        joinedAt: kst('2026-04-12T11:00:00'),
      },
    });
  }

  const books = {};
  const createBooks = async (clubId, bookDefs) => {
    for (const { key, participants, periodFrom, periodTo, meetingDate, ...data } of bookDefs) {
      books[key] = await prisma.book.create({
        data: {
          ...data,
          clubId,
          periodFrom: kst(periodFrom),
          periodTo: kst(periodTo),
          meetingDate: kst(meetingDate),
          createdAt: kst(periodFrom),
          participants: {
            create: participants.map((p) => ({ memberId: members[p].id })),
          },
        },
      });
    }
  };
  await createBooks(club.id, BOOKS);
  await createBooks(club2.id, BOOKS2);

  const comments = {};
  for (const { key, book, by, parent, at, editedAt, deletedAt, ...data } of COMMENTS) {
    comments[key] = await prisma.comment.create({
      data: {
        ...data,
        bookId: books[book].id,
        memberId: members[by].id,
        parentId: parent ? comments[parent].id : null,
        createdAt: kst(at),
        updatedAt: kst(editedAt ?? at),
        deletedAt: deletedAt ? kst(deletedAt) : null,
      },
    });
  }

  // 코멘트 공감 — 토론이 활발해 보이도록 주요 코멘트에 분포
  const LIKES = {
    c1: ['minjun', 'seoyeon', 'haneul'],
    c3: ['jiwon', 'doyun'],
    c7: ['jiwon', 'seoyeon', 'eunchae', 'haneul'],
    c11: ['jiwon', 'minjun', 'seoyeon', 'haneul', 'eunchae'],
    c13: ['eunchae', 'jiwon'],
    c16: ['haneul', 'minjun'],
    c20: ['seoyeon', 'haneul', 'doyun'],
    c22: ['seoyeon', 'jiwon', 'minjun'],
    c28: ['haneul', 'doyun', 'seoyeon'],
    c33: ['eunchae', 'minjun'],
    c36: ['seoyeon', 'eunchae'],
    c39: ['jiwon', 'yujin'],
    c40: ['seojun'],
  };
  let likeCount = 0;
  for (const [commentKey, likerKeys] of Object.entries(LIKES)) {
    for (const likerKey of likerKeys) {
      await prisma.commentLike.create({
        data: {
          commentId: comments[commentKey].id,
          memberId: members[likerKey].id,
        },
      });
      likeCount += 1;
    }
  }

  // 문집 주문 — 완결·진행 중·접수 직후·4권 수록·타 클럽 주문을 시연
  const ORDERS = [
    {
      by: 'jiwon',
      title: '페이지 너머 문집 Vol.1 — 상반기의 기록',
      copies: 6,
      books: ['almond', 'library', 'pachinko'],
      history: [
        ['RECEIVED', '2026-06-16T10:00:00', 'USER'],
        ['CONFIRMED', '2026-06-16T15:30:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-18T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-24T17:00:00', 'ADMIN'],
        ['SHIPPED', '2026-06-25T11:00:00', 'ADMIN'],
        ['IN_TRANSIT', '2026-06-26T08:30:00', 'ADMIN'],
        ['DELIVERED', '2026-06-27T14:20:00', 'ADMIN'],
        ['PURCHASE_CONFIRMED', '2026-06-28T20:10:00', 'USER'],
      ],
    },
    {
      by: 'minjun',
      title: '여름 소책자 — 불편한 편의점 편',
      copies: 3,
      books: ['store'],
      history: [
        ['RECEIVED', '2026-07-14T21:00:00', 'USER'],
        ['CONFIRMED', '2026-07-15T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-16T09:30:00', 'ADMIN'],
        ['PRODUCED', '2026-07-22T18:00:00', 'ADMIN'],
        ['SHIPPED', '2026-07-23T10:00:00', 'ADMIN'],
        ['IN_TRANSIT', '2026-07-24T07:40:00', 'ADMIN'],
      ],
    },
    {
      by: 'jiwon',
      title: '가을 문집 준비호 — 완독 기록 모음',
      copies: 6,
      books: ['library', 'pachinko'],
      history: [['RECEIVED', '2026-07-26T22:40:00', 'USER']],
    },
    // 4권 수록 — 표지 나열 뷰 확인용
    {
      by: 'jiwon',
      title: '페이지 너머 문집 Vol.2 — 완독 전집',
      copies: 8,
      books: ['store', 'almond', 'library', 'pachinko'],
      history: [
        ['RECEIVED', '2026-07-20T21:00:00', 'USER'],
        ['CONFIRMED', '2026-07-21T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-22T09:00:00', 'ADMIN'],
      ],
    },
    // 다른 클럽(밑줄과 여백)의 주문 — 마이페이지 클럽 구분 표시 확인용
    {
      club: 'margin',
      by: 'jiwon',
      title: '쇼코의 미소 — 밑줄 모음집',
      copies: 3,
      books: ['shoko'],
      history: [
        ['RECEIVED', '2026-06-02T20:00:00', 'USER'],
        ['CONFIRMED', '2026-06-03T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-04T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-08T17:00:00', 'ADMIN'],
        ['SHIPPED', '2026-06-09T10:00:00', 'ADMIN'],
        ['IN_TRANSIT', '2026-06-09T18:00:00', 'ADMIN'],
        ['DELIVERED', '2026-06-10T14:00:00', 'ADMIN'],
      ],
    },
    // 배송완료 상태 2건 — 구매 확정·환불/재제작 요청 버튼 시연용 (밑줄과 여백 멤버들)
    {
      club: 'margin',
      by: 'seojun',
      title: '쇼코의 미소 — 서준의 밑줄 소장본',
      copies: 1,
      books: ['shoko'],
      history: [
        ['RECEIVED', '2026-06-15T20:00:00', 'USER'],
        ['CONFIRMED', '2026-06-16T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-17T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-20T17:00:00', 'ADMIN'],
        ['SHIPPED', '2026-06-21T10:00:00', 'ADMIN'],
        ['IN_TRANSIT', '2026-06-21T18:00:00', 'ADMIN'],
        ['DELIVERED', '2026-06-22T14:00:00', 'ADMIN'],
      ],
    },
    {
      club: 'margin',
      by: 'yujin',
      title: '쇼코의 미소 — 문장 수집 노트',
      copies: 2,
      books: ['shoko'],
      history: [
        ['RECEIVED', '2026-07-18T21:30:00', 'USER'],
        ['CONFIRMED', '2026-07-19T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-20T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-07-23T17:00:00', 'ADMIN'],
        ['SHIPPED', '2026-07-24T10:00:00', 'ADMIN'],
        ['IN_TRANSIT', '2026-07-24T19:00:00', 'ADMIN'],
        ['DELIVERED', '2026-07-25T15:00:00', 'ADMIN'],
      ],
    },
  ];
  for (const orderDef of ORDERS) {
    const historyRows = orderDef.history.map(([toStatus, at, actor], i) => ({
      fromStatus: i === 0 ? null : orderDef.history[i - 1][0],
      toStatus,
      actor,
      changedAt: kst(at),
    }));
    const last = orderDef.history[orderDef.history.length - 1];
    await prisma.order.create({
      data: {
        clubId: orderDef.club === 'margin' ? club2.id : club.id,
        memberId: members[orderDef.by].id,
        title: orderDef.title,
        copies: orderDef.copies,
        status: last[0],
        createdAt: kst(orderDef.history[0][1]),
        books: {
          create: orderDef.books.map((bookKey, index) => ({
            bookId: books[bookKey].id,
            position: index,
          })),
        },
        history: { create: historyRows },
      },
    });
  }

  console.log(
    `[seed] 완료 — 모임 2, 멤버 ${Object.keys(members).length}, 책 ${BOOKS.length + BOOKS2.length}, 코멘트·답글 ${COMMENTS.length}, 공감 ${likeCount}, 주문 ${ORDERS.length}`,
  );
}

main()
  .catch((e) => {
    console.error('[seed] 실패:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
