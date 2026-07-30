// 시드: 모임 2(멀티 클럽 시연 — 서지원·김민준이 두 클럽에 가입, 역할이 다름), 회원 8,
// 책 16(읽는 중 3·예정 1·완독 12), 코멘트·답글 46, 주문 17(상태·클럽·기간 분산 — 어드민 필터·페이지네이션 확인용)
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
  { key: 'dallergut', title: '달러구트 꿈 백화점', author: '이미예', publisher: '팩토리나인', coverColor: '#7E6BC4', coverEmoji: '🌠', status: 'DONE', periodFrom: '2026-01-26T00:00:00', periodTo: '2026-02-22T00:00:00', meetingDate: '2026-02-22T20:00:00', participants: ['jiwon', 'minjun', 'seoyeon', 'haneul'] },
  { key: 'hyunam', title: '어서 오세요, 휴남동 서점입니다', author: '황보름', publisher: '클레이하우스', coverColor: '#5E8B6B', coverEmoji: '🌿', status: 'DONE', periodFrom: '2026-02-23T00:00:00', periodTo: '2026-03-22T00:00:00', meetingDate: '2026-03-22T20:00:00', participants: ['jiwon', 'seoyeon', 'haneul', 'doyun', 'eunchae'] },
  { key: 'farewell', title: '작별인사', author: '김영하', publisher: '복복서가', coverColor: '#3C4F76', coverEmoji: '🤖', status: 'DONE', periodFrom: '2025-12-01T00:00:00', periodTo: '2025-12-28T00:00:00', meetingDate: '2025-12-28T20:00:00', participants: ['jiwon', 'minjun', 'doyun', 'eunchae'] },
  { key: 'pagwa', title: '파과', author: '구병모', publisher: '자음과모음', coverColor: '#8A4B53', coverEmoji: '🌹', status: 'DONE', periodFrom: '2025-11-03T00:00:00', periodTo: '2025-11-30T00:00:00', meetingDate: '2025-11-30T20:00:00', participants: ['jiwon', 'seoyeon', 'haneul', 'eunchae'] },
  { key: 'longnight', title: '긴긴밤', author: '루리', publisher: '문학동네', coverColor: '#41698C', coverEmoji: '🐧', status: 'DONE', periodFrom: '2025-10-06T00:00:00', periodTo: '2025-11-02T00:00:00', meetingDate: '2025-11-02T20:00:00', participants: ['jiwon', 'minjun', 'seoyeon', 'haneul', 'doyun', 'eunchae'] },
  { key: 'smallthings', title: '이처럼 사소한 것들', author: '클레어 키건', publisher: '다산책방', coverColor: '#6E7F5C', coverEmoji: '❄️', status: 'DONE', periodFrom: '2025-12-29T00:00:00', periodTo: '2026-01-25T00:00:00', meetingDate: '2026-01-25T20:00:00', participants: ['jiwon', 'minjun', 'haneul'] },
  { key: 'bluehorse', title: '천 개의 파랑', author: '천선란', publisher: '허블', coverColor: '#2E6E8E', coverEmoji: '🐎', status: 'DONE', periodFrom: '2025-09-08T00:00:00', periodTo: '2025-10-05T00:00:00', meetingDate: '2025-10-05T20:00:00', participants: ['jiwon', 'minjun', 'seoyeon', 'doyun'] },
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
    key: 'villa',
    title: '여름의 빌라',
    author: '백수린',
    publisher: '문학동네',
    coverColor: '#8E7CC3',
    coverEmoji: '🏖️',
    status: 'READING',
    periodFrom: '2026-07-20T00:00:00',
    periodTo: '2026-08-16T00:00:00',
    meetingDate: '2026-08-16T14:00:00',
    participants: ['seojun', 'yujin', 'minjun'],
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
  {
    key: 'mnight',
    title: '밝은 밤',
    author: '최은영',
    publisher: '문학동네',
    coverColor: '#3F5E8C',
    coverEmoji: '🌙',
    status: 'DONE',
    periodFrom: '2026-03-02T00:00:00',
    periodTo: '2026-03-29T00:00:00',
    meetingDate: '2026-03-29T14:00:00',
    participants: ['seojun', 'yujin', 'minjun'],
  },
  {
    key: 'mdeer',
    title: '사슴벌레식 문답',
    author: '구병모',
    publisher: '창비',
    coverColor: '#7A6A55',
    coverEmoji: '🪵',
    status: 'DONE',
    periodFrom: '2026-01-05T00:00:00',
    periodTo: '2026-02-01T00:00:00',
    meetingDate: '2026-02-01T14:00:00',
    participants: ['seojun', 'yujin'],
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

  // 달러구트 꿈 백화점 (완료 — 2월 모임)
  { key: 'c47', book: 'dallergut', by: 'seoyeon', page: 33, quote: '꿈을 사고파는 가게', content: '설정만으로 이미 절반은 성공한 소설 같아요. 1층부터 5층까지 층별 구성이 귀엽고 명확해서 술술 읽혔습니다.', at: '2026-02-14T21:10:00' },
  { key: 'c48', book: 'dallergut', by: 'haneul', parent: 'c47', content: '저는 3층 낮잠 코너에서 오래 머물렀어요. 낮잠 꿈을 따로 판다는 발상이 좋았습니다.', at: '2026-02-15T09:20:00' },
  { key: 'c49', book: 'dallergut', by: 'minjun', page: 148, content: '꿈값을 감정으로 치른다는 설정에서 잠깐 멈췄어요. 우리가 뭘 지불하며 사는지 생각하게 되더라고요.', at: '2026-02-17T22:35:00' },
  { key: 'c50', book: 'dallergut', by: 'jiwon', parent: 'c49', content: '이 대목 모임에서 이야기 나눠요. 감정을 화폐로 쓰는 세계라니, 은근히 서늘합니다.', at: '2026-02-18T07:40:00' },
  { key: 'c51', book: 'dallergut', by: 'seoyeon', content: '모임 마치고 남기는 감상. 가볍게 시작했다가 마지막엔 위로받고 끝나는 책이었어요. 겨울에 읽기 잘했습니다.', at: '2026-02-22T22:30:00' },

  // 어서 오세요, 휴남동 서점입니다 (완료 — 3월 모임)
  { key: 'c52', book: 'hyunam', by: 'eunchae', page: 61, content: '서점 주인 영주가 아무것도 하지 않기로 결심하는 초반부가 제일 좋았어요. 회복에도 시간이 필요하다는 걸 조용히 보여줘서.', at: '2026-03-10T20:15:00' },
  { key: 'c53', book: 'hyunam', by: 'doyun', parent: 'c52', content: '저도요. 사건이 크게 없는데도 계속 읽게 되는 힘이 있더라고요.', at: '2026-03-11T08:05:00' },
  { key: 'c54', book: 'hyunam', by: 'haneul', quote: '좋아하는 일을 오래 하려면 어떻게 해야 할까', content: '이 질문이 책 전체를 관통하는 것 같아요. 바리스타 민준 씨 이야기에서 특히요.', at: '2026-03-16T21:50:00' },
  { key: 'c55', book: 'hyunam', by: 'jiwon', content: '독서모임 하는 사람들에게는 좀 특별한 책이죠. 서점이라는 공간이 사람을 어떻게 붙잡아 두는지 잘 그려서요.', at: '2026-03-22T22:10:00' },

  // 작별인사 (완료 — 12월 모임)
  { key: 'c56', book: 'farewell', by: 'doyun', page: 95, content: '철이가 자기 존재를 의심하기 시작하는 지점부터 완전히 다른 이야기가 되네요. 초반의 잔잔함이 복선이었어요.', at: '2025-12-18T22:40:00' },
  { key: 'c57', book: 'farewell', by: 'minjun', parent: 'c56', content: '그 장면에서 책을 덮고 한참 있었습니다. SF의 외피를 쓴 성장소설 같기도 하고요.', at: '2025-12-19T07:30:00' },
  { key: 'c58', book: 'farewell', by: 'eunchae', quote: '우리는 어디서 와서 어디로 가는가', content: '결말이 오래 남는 책이에요. 마지막 선택을 두고 모임에서 이야기 나누고 싶습니다.', at: '2025-12-24T21:05:00' },
  { key: 'c59', book: 'farewell', by: 'jiwon', content: '한 해 마지막 책으로 고르길 잘했네요. 작별이라는 말이 이렇게 담담할 수 있다는 게 좋았습니다.', at: '2025-12-28T22:00:00' },

  // 쇼코의 미소 — 밑줄과여백 (완료, 추가 토론)
  { key: 'c60', book: 'shoko', by: 'seojun', page: 47, content: '표제작에서 쇼코와 소유가 편지를 주고받는 리듬이 좋았어요. 답장이 늦어지는 간격까지 이야기의 일부 같습니다.', at: '2026-05-16T21:20:00' },
  { key: 'c61', book: 'shoko', by: 'yujin', parent: 'c60', content: '맞아요. 편지가 끊긴 동안 두 사람이 각자 어떻게 지냈을지 상상하게 되더라고요.', at: '2026-05-17T09:10:00' },
  { key: 'c62', book: 'shoko', by: 'minjun', quote: '나는 그때 할아버지의 마음을 조금도 헤아리지 못했다', content: '「씬짜오, 씬짜오」의 이 문장에서 오래 멈췄습니다. 뒤늦게 오는 이해에 대한 소설이네요.', at: '2026-05-25T20:40:00' },
  { key: 'c63', book: 'shoko', by: 'seojun', content: '모임 마무리 감상입니다. 최은영 작가의 문장은 조용한데 오래 남아요. 다음 책도 같은 작가로 가보면 좋겠습니다.', at: '2026-05-31T16:30:00' },

  // 밝은 밤 — 밑줄과여백 (완료, 3월)
  { key: 'c64', book: 'mnight', by: 'yujin', page: 24, content: '지연이 희령으로 내려가면서 이야기가 시작되는데, 첫 장부터 공기가 다르네요. 도망이 아니라 회복의 시작 같아서요.', at: '2026-03-08T20:30:00' },
  { key: 'c65', book: 'mnight', by: 'seojun', parent: 'c64', content: '저도 그 대목요. 낯선 동네에서 증조할머니를 만나는 우연이 억지스럽지 않아서 좋았습니다.', at: '2026-03-09T08:15:00' },
  { key: 'c66', book: 'mnight', by: 'minjun', page: 132, quote: '엄마의 엄마의 엄마', content: '4대에 걸친 여자들의 이야기가 겹쳐지는 구조가 이 소설의 핵심 같아요. 계보가 아니라 목소리의 이어짐으로 읽혔습니다.', at: '2026-03-14T22:05:00' },
  { key: 'c67', book: 'mnight', by: 'yujin', parent: 'c66', content: '증조할머니 삼천이 이야기가 나올 때마다 숨을 참게 되더라고요. 백정의 딸이라는 이유로 겪는 일들이요.', at: '2026-03-15T10:40:00' },
  { key: 'c68', book: 'mnight', by: 'seojun', page: 210, content: '새비 아주머니와의 우정이 이 소설에서 가장 밝은 부분인 것 같아요. 제목의 밤이 어둡지만은 않은 이유.', at: '2026-03-19T21:50:00' },
  { key: 'c69', book: 'mnight', by: 'yujin', content: '천문대에서 별을 보는 장면들이 계속 돌아오는 게 좋았어요. 오래전 빛이 지금 도착한다는 것도 이 소설의 구조와 닮았고요.', at: '2026-03-24T22:20:00' },
  { key: 'c70', book: 'mnight', by: 'minjun', parent: 'c69', content: '그 비유 좋네요. 지나간 일이 뒤늦게 지금에 도착한다는 점에서요.', at: '2026-03-25T07:55:00' },
  { key: 'c71', book: 'mnight', by: 'seojun', content: '모임 후기 남깁니다. 「쇼코의 미소」에서 넘어와 읽으니 작가의 관심이 어디에 있는지 더 선명해졌어요.', at: '2026-03-29T16:10:00' },

  // 사슴벌레식 문답 — 밑줄과여백 (완료, 1월)
  { key: 'c72', book: 'mdeer', by: 'seojun', page: 18, quote: '그건 사슴벌레가 알 바 아니고', content: '제목의 문답이 뭔지 초반에 바로 알려주는데, 그 무심함이 이 소설의 태도 같습니다.', at: '2026-01-12T20:40:00' },
  { key: 'c73', book: 'mdeer', by: 'yujin', parent: 'c72', content: '그 말투가 처음엔 차갑게 느껴졌는데, 읽다 보니 살아남은 사람의 방어처럼 읽혔어요.', at: '2026-01-13T09:25:00' },
  { key: 'c74', book: 'mdeer', by: 'yujin', page: 87, content: '네 사람의 관계가 조금씩 어긋나 있는 게 계속 신경 쓰이네요. 같은 사건을 다르게 기억하는 방식이요.', at: '2026-01-19T21:15:00' },
  { key: 'c75', book: 'mdeer', by: 'seojun', parent: 'c74', content: '기억이 각자에게 유리하게 재배치된다는 게 무섭기도 했습니다.', at: '2026-01-20T08:00:00' },
  { key: 'c76', book: 'mdeer', by: 'seojun', content: '중반 이후로는 미스터리처럼 읽혀요. 다음 모임 전까지 다 읽고 오시면 이야기할 게 많을 것 같습니다.', at: '2026-01-25T22:30:00' },
  { key: 'c77', book: 'mdeer', by: 'yujin', content: '모임 마치고 남기는 감상. 첫 책치고 묵직했지만 이야기가 잘 굴러가서 좋았어요. 다음은 조금 밝은 걸로 가요 😅', at: '2026-02-01T16:20:00' },
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
      createdAt: kst('2025-09-01T10:00:00'),
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
        joinedAt: kst('2025-09-01T10:30:00'),
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

  // 판형·분량·금액 — 값과 공식은 src/shared/bookprint/의 카탈로그·산출기와 동일하다.
  // 시드는 TS 빌드 산출물에 의존하지 않으려고 표를 복사해 둔다 (바뀌면 양쪽을 함께 고친다).
  const SPECS = {
    PHOTOBOOK_A5_SC: { pageMin: 50, priceBase: 12800, perInc: 300 },
    PHOTOBOOK_A4_SC: { pageMin: 24, priceBase: 16800, perInc: 400 },
    SQUAREBOOK_HC: { pageMin: 24, priceBase: 19800, perInc: 500 },
  };
  const SHIPPING_FEE = 3000;
  const commentCountByBookId = new Map();
  for (const c of COMMENTS) {
    if (c.deletedAt) continue;
    const id = books[c.book].id;
    commentCountByBookId.set(id, (commentCountByBookId.get(id) ?? 0) + 1);
  }
  // 속표지·모임 소개·목차 3 + 책마다 2 + 코멘트 1쪽 + 참여자·맺음말 2 → 짝수 보정
  const estimatePages = (bookKeys) => {
    const raw =
      3 +
      bookKeys.length * 2 +
      bookKeys.reduce(
        (sum, key) => sum + (commentCountByBookId.get(books[key].id) ?? 0),
        0,
      ) +
      2;
    return raw % 2 === 0 ? raw : raw + 1;
  };
  const quote = (specUid, pageCount, copies) => {
    const spec = SPECS[specUid];
    const unitPrice =
      spec.priceBase +
      Math.max(0, Math.ceil((pageCount - spec.pageMin) / 2)) * spec.perInc;
    return { unitPrice, productAmount: unitPrice * copies };
  };
  // 발주 이후 단계는 제작처가 통보한다 — 우리 상태별 벤더 상태 (D-034)
  const VENDOR_STATUS = {
    IN_PRODUCTION: 'IN_PRODUCTION',
    PRODUCED: 'PRODUCTION_COMPLETE',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    PURCHASE_CONFIRMED: 'DELIVERED',
    REFUND_REQUESTED: 'DELIVERED',
    REFUNDED: 'DELIVERED',
    REMAKE_REQUESTED: 'DELIVERED',
  };

  // 문집 주문 — 완결·진행 중·접수 직후·4권 수록·타 클럽 주문을 시연
  const ORDERS = [
    {
      by: 'jiwon',
      title: '페이지 너머 문집 Vol.1 — 상반기의 기록',
      copies: 6,
      spec: 'SQUAREBOOK_HC',
      cover: ['#4A6FA5', '📚'],
      books: ['almond', 'library', 'pachinko'],
      history: [
        ['RECEIVED', '2026-06-16T10:00:00', 'USER'],
        ['CONFIRMED', '2026-06-16T15:30:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-18T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-24T17:00:00', 'VENDOR'],
        ['SHIPPED', '2026-06-25T11:00:00', 'VENDOR'],
        ['DELIVERED', '2026-06-27T14:20:00', 'VENDOR'],
        ['PURCHASE_CONFIRMED', '2026-06-28T20:10:00', 'USER'],
      ],
    },
    {
      by: 'minjun',
      title: '여름 소책자 — 완독 두 권',
      copies: 3,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#E07A5F', '☀️'],
      books: ['store', 'almond'],
      history: [
        ['RECEIVED', '2026-07-14T21:00:00', 'USER'],
        ['CONFIRMED', '2026-07-15T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-16T09:30:00', 'ADMIN'],
        ['PRODUCED', '2026-07-22T18:00:00', 'VENDOR'],
        ['SHIPPED', '2026-07-23T10:00:00', 'VENDOR'],
      ],
    },
    {
      by: 'jiwon',
      title: '가을 문집 준비호 — 완독 기록 모음',
      copies: 6,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#8E7CC3', '🍂'],
      books: ['library', 'pachinko', 'dallergut'],
      history: [['RECEIVED', '2026-07-26T22:40:00', 'USER']],
    },
    // 4권 수록 — 표지 나열 뷰 확인용
    {
      by: 'jiwon',
      title: '페이지 너머 문집 Vol.2 — 완독 전집',
      copies: 8,
      spec: 'PHOTOBOOK_A5_SC',
      cover: ['#2F4858', '🏛️'],
      books: ['store', 'almond', 'library', 'pachinko', 'dallergut', 'hyunam', 'farewell'],
      history: [
        ['RECEIVED', '2026-07-20T21:00:00', 'USER'],
        ['CONFIRMED', '2026-07-21T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-22T09:00:00', 'ADMIN'],
      ],
    },
    // 어드민 목록 페이지네이션·필터 확인용 — 클럽·주문자·상태·기간을 흩어 배치
    {
      by: 'minjun',
      title: '봄 문집 — 첫 계절의 기록',
      copies: 4,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#7FB069', '🌸'],
      books: ['pachinko', 'library', 'hyunam'],
      history: [
        ['RECEIVED', '2026-04-22T20:10:00', 'USER'],
        ['CONFIRMED', '2026-04-23T09:40:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-04-24T10:00:00', 'ADMIN'],
        ['PRODUCED', '2026-04-29T16:00:00', 'VENDOR'],
        ['SHIPPED', '2026-04-30T09:30:00', 'VENDOR'],
        ['DELIVERED', '2026-05-01T13:20:00', 'VENDOR'],
        ['PURCHASE_CONFIRMED', '2026-05-02T21:00:00', 'USER'],
      ],
    },
    {
      by: 'seoyeon',
      title: '아몬드 · 편의점 독후감 모음',
      copies: 5,
      spec: 'SQUAREBOOK_HC',
      cover: ['#D96C6C', '🌰'],
      books: ['almond', 'store'],
      history: [
        ['RECEIVED', '2026-06-20T19:00:00', 'USER'],
        ['CONFIRMED', '2026-06-21T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-22T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-26T17:00:00', 'VENDOR'],
        ['SHIPPED', '2026-06-27T10:00:00', 'VENDOR'],
      ],
    },
    {
      by: 'haneul',
      title: '하늘의 소장본 — 완독 두 권',
      copies: 1,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#5B8C85', '🏪'],
      books: ['store', 'library'],
      history: [
        ['RECEIVED', '2026-07-02T21:15:00', 'USER'],
        ['CONFIRMED', '2026-07-03T09:20:00', 'ADMIN'],
      ],
    },
    {
      by: 'doyun',
      title: '완독 3권 합본 — 도윤의 서재',
      copies: 2,
      spec: 'SQUAREBOOK_HC',
      cover: ['#6B705C', '📖'],
      books: ['store', 'library', 'pachinko'],
      history: [
        ['RECEIVED', '2026-07-09T22:30:00', 'USER'],
        ['CONFIRMED', '2026-07-10T10:10:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-11T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-07-16T18:00:00', 'VENDOR'],
      ],
    },
    {
      by: 'eunchae',
      title: '은채의 밑줄 — 라이브러리와 아몬드',
      copies: 1,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#9C6644', '🌙'],
      books: ['library', 'almond'],
      history: [['RECEIVED', '2026-07-27T20:05:00', 'USER']],
    },
    {
      by: 'seoyeon',
      title: '여름 완독 기념 문집',
      copies: 3,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#C08552', '🌻'],
      books: ['store', 'almond'],
      history: [
        ['RECEIVED', '2026-07-28T09:40:00', 'USER'],
        ['CONFIRMED', '2026-07-28T11:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-29T09:00:00', 'ADMIN'],
      ],
    },
    {
      by: 'haneul',
      title: '취소된 문집 — 부수 변경 예정',
      copies: 2,
      spec: 'SQUAREBOOK_HC',
      cover: ['#6D6875', '✂️'],
      books: ['almond', 'store'],
      history: [
        ['RECEIVED', '2026-05-11T20:00:00', 'USER'],
        ['CANCELED', '2026-05-11T20:30:00', 'USER'],
      ],
    },
    {
      club: 'margin',
      by: 'yujin',
      title: '밑줄과 여백 — 봄 단편 모음',
      copies: 3,
      spec: 'SQUAREBOOK_HC',
      cover: ['#6B8CAE', '💌'],
      books: ['shoko', 'mnight'],
      history: [
        ['RECEIVED', '2026-06-25T21:00:00', 'USER'],
        ['CONFIRMED', '2026-06-26T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-27T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-07-01T17:00:00', 'VENDOR'],
        ['SHIPPED', '2026-07-02T10:00:00', 'VENDOR'],
        ['DELIVERED', '2026-07-03T14:00:00', 'VENDOR'],
        ['REFUND_REQUESTED', '2026-07-04T09:10:00', 'USER', 'PRINT_DEFECT', '20~24쪽 인쇄가 겹쳐 나왔어요.'],
        ['REFUNDED', '2026-07-05T11:00:00', 'ADMIN'],
      ],
    },
    {
      club: 'margin',
      by: 'seojun',
      title: '밑줄과 여백 — 상반기 모임 기록본',
      copies: 2,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#3F5E8C', '🌙'],
      books: ['shoko', 'mnight', 'mdeer'],
      history: [['RECEIVED', '2026-07-29T21:40:00', 'USER']],
    },
    {
      club: 'margin',
      by: 'minjun',
      title: '밑줄과 여백 — 민준의 첫 문집',
      copies: 1,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#7A6A55', '🪵'],
      books: ['shoko', 'mnight'],
      history: [
        ['RECEIVED', '2026-07-25T20:20:00', 'USER'],
        ['CONFIRMED', '2026-07-26T10:00:00', 'ADMIN'],
      ],
    },
    // 다른 클럽(밑줄과 여백)의 주문 — 마이페이지 클럽 구분 표시 확인용
    {
      club: 'margin',
      by: 'jiwon',
      title: '밑줄과 여백 — 밑줄 모음집',
      copies: 3,
      spec: 'SQUAREBOOK_HC',
      cover: ['#4C6A92', '📮'],
      books: ['shoko', 'mnight', 'mdeer'],
      history: [
        ['RECEIVED', '2026-06-02T20:00:00', 'USER'],
        ['CONFIRMED', '2026-06-03T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-04T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-08T17:00:00', 'VENDOR'],
        ['SHIPPED', '2026-06-09T10:00:00', 'VENDOR'],
        ['DELIVERED', '2026-06-10T14:00:00', 'VENDOR'],
      ],
    },
    // 배송완료 상태 2건 — 구매 확정·환불/재제작 요청 버튼 시연용 (밑줄과 여백 멤버들)
    {
      club: 'margin',
      by: 'seojun',
      title: '서준의 밑줄 소장본',
      copies: 1,
      spec: 'PHOTOBOOK_A4_SC',
      cover: ['#8A9A5B', '🖋️'],
      books: ['shoko', 'mnight'],
      history: [
        ['RECEIVED', '2026-06-15T20:00:00', 'USER'],
        ['CONFIRMED', '2026-06-16T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-06-17T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-06-20T17:00:00', 'VENDOR'],
        ['SHIPPED', '2026-06-21T10:00:00', 'VENDOR'],
        ['DELIVERED', '2026-06-22T14:00:00', 'VENDOR'],
      ],
    },
    {
      club: 'margin',
      by: 'yujin',
      title: '문장 수집 노트 — 상반기 완독본',
      copies: 2,
      spec: 'SQUAREBOOK_HC',
      cover: ['#A4778B', '📝'],
      books: ['shoko', 'mnight', 'mdeer'],
      history: [
        ['RECEIVED', '2026-07-18T21:30:00', 'USER'],
        ['CONFIRMED', '2026-07-19T10:00:00', 'ADMIN'],
        ['IN_PRODUCTION', '2026-07-20T09:00:00', 'ADMIN'],
        ['PRODUCED', '2026-07-23T17:00:00', 'VENDOR'],
        ['SHIPPED', '2026-07-24T10:00:00', 'VENDOR'],
        ['DELIVERED', '2026-07-25T15:00:00', 'VENDOR'],
      ],
    },
  ];
  /**
   * 우리 상태 이력 → 제작처가 보냈을 이벤트로 되짚는다.
   * 발주(order.created) 직후 PDF_READY로 승격되고, 제작 확정·시작은 우리 상태를 바꾸지
   * 않으므로 이력에는 없지만 제작처는 보냈다 — 그 구간을 로그로 채운다.
   */
  const buildVendorEvents = (orderDef, index) => {
    const at = (status) => orderDef.history.find((row) => row[0] === status);
    const events = [];
    const dispatched = at('IN_PRODUCTION');
    if (!dispatched) return events;

    events.push({
      event: 'order.created',
      vendorStatus: 'PDF_READY',
      detail: `발주 완료 · or_${index}${vendorSuffix()}`,
      receivedAt: kst(dispatched[1]),
    });
    // 제작 확정·시작은 발주 다음 날 오전에 순서대로 들어온 것으로
    const dispatchedAt = new Date(kst(dispatched[1]));
    const plusHours = (hours) =>
      new Date(dispatchedAt.getTime() + hours * 3600 * 1000);
    events.push({
      event: 'production.confirmed',
      vendorStatus: 'CONFIRMED',
      receivedAt: plusHours(2),
    });
    events.push({
      event: 'production.started',
      vendorStatus: 'IN_PRODUCTION',
      receivedAt: plusHours(20),
    });

    const produced = at('PRODUCED');
    if (produced)
      events.push({
        event: 'production.completed',
        vendorStatus: 'PRODUCTION_COMPLETE',
        receivedAt: kst(produced[1]),
      });
    const shipped = at('SHIPPED');
    if (shipped)
      events.push({
        event: 'shipping.departed',
        vendorStatus: 'SHIPPED',
        detail: `한진택배 41${index}${trackingSuffix()}`,
        receivedAt: kst(shipped[1]),
      });
    const delivered = at('DELIVERED');
    if (delivered)
      events.push({
        event: 'shipping.delivered',
        vendorStatus: 'DELIVERED',
        receivedAt: kst(delivered[1]),
      });
    return events;
  };

  // 벤더 식별자는 형식만 재현한다 — 시드 결과가 매번 같도록 순번 기반으로 만든다
  let orderIndex = 0;
  const vendorSuffix = () => String(1000 + orderIndex * 37).padStart(4, '0');
  const trackingSuffix = () => String(20260000 + orderIndex * 131);

  for (const orderDef of ORDERS) {
    orderIndex += 1;
    const historyRows = orderDef.history.map(
      ([toStatus, at, actor, reason, reasonDetail], i) => ({
        fromStatus: i === 0 ? null : orderDef.history[i - 1][0],
        toStatus,
        actor,
        changedAt: kst(at),
        reason: reason ?? null,
        reasonDetail: reasonDetail ?? null,
      }),
    );
    const last = orderDef.history[orderDef.history.length - 1];
    const pageCount = estimatePages(orderDef.books);
    const { unitPrice, productAmount } = quote(
      orderDef.spec,
      pageCount,
      orderDef.copies,
    );
    // 발주(IN_PRODUCTION) 이후 주문만 벤더 주문번호를 갖는다
    const vendorStatus = VENDOR_STATUS[last[0]] ?? null;
    const vendorEvent = orderDef.history.find(
      (row) => row[0] === 'IN_PRODUCTION',
    );
    const shippedAt = orderDef.history.find((row) => row[0] === 'SHIPPED');
    await prisma.order.create({
      data: {
        clubId: orderDef.club === 'margin' ? club2.id : club.id,
        memberId: members[orderDef.by].id,
        title: orderDef.title,
        copies: orderDef.copies,
        bookSpecUid: orderDef.spec,
        coverColor: orderDef.cover[0],
        coverEmoji: orderDef.cover[1],
        pageCount,
        unitPrice,
        productAmount,
        shippingFee: SHIPPING_FEE,
        status: last[0],
        createdAt: kst(orderDef.history[0][1]),
        statusChangedAt: kst(last[1]),
        vendorOrderUid: vendorEvent ? `or_${orderIndex}${vendorSuffix()}` : null,
        vendorStatus: vendorEvent ? vendorStatus : null,
        vendorStatusAt: vendorEvent ? kst(last[1]) : null,
        trackingCarrier: shippedAt ? '한진택배' : null,
        trackingNumber: shippedAt ? `41${orderIndex}${trackingSuffix()}` : null,
        // 발주 이후 단계는 제작처 웹훅으로 들어온 것 — 수신 로그도 함께 남긴다 (D-034)
        vendorEvents: vendorEvent
          ? { create: buildVendorEvents(orderDef, orderIndex) }
          : undefined,
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
