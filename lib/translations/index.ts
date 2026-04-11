export type Translations = {
  // theme labels
  themeLabels: Record<string, string>;

  // create page
  sendButton: string;
  placePlaceholders: string[];
  photoHint: string;
  inviteModalTitle: string;
  inviteModalDesc: string;
  copyLink: string;
  shareLink: string;
  openPreview: string;
  linkCopied: string;
  alertTitleRequired: string;
  alertPlaceRequired: string;
  alertImageTooLarge: string;
  alertImageUnsupported: string;
  alertPayloadTooLarge: string;
  alertCreateFailed: string;

  // accept page
  acceptHeading: string;
  acceptSubheading: string;
  yesLabel: string;
  acceptInviteLabel: string;
  noLabel: string;
  expiredTitle: string;
  expiredDesc: string;

  // result page
  loading: string;
  notAcceptedTitle: string;
  notAcceptedDesc: string;
  goToAccept: string;
  photoNotice: string;
  createOwn: string;
  createInvitation: string;

  // invitation card
  datePlaceholder: string;
  timePlaceholder: string;
  placePlaceholder: string;

  // top banner ad
  adPlaceholderText: string;
  adContactTitle: string;
  adCreatedCount: string;
  adAcceptedCount: string;
  adClose: string;
  adEmailCopied: string;
};

// ─── Korean ───────────────────────────────────────────────────────────────────

const ko: Translations = {
  themeLabels: {
    "promise": "친구 약속",
    "weekend-date": "주말 데이트",
    "birthday": "생일",
    "childrens-day": "어린이날",
    "samgyeopsal-day": "삼겹살 데이",
    "white-day": "화이트 데이",
    "valentine": "발렌타인 데이",
    "christmas": "크리스마스",
    "pepero": "빼빼로 데이",
    "lunar-new-year": "설날",
    "chuseok": "추석",
  },
  sendButton: "초대장 보내기",
  placePlaceholders: ["홍대입구역", "성수역", "여의도한강공원", "잠실 롯데월드몰", "광화문 광장"],
  photoHint: "사진을 누르면 이미지를 변경할 수 있습니다.",
  inviteModalTitle: "초대 링크가 생성되었습니다",
  inviteModalDesc: "링크 공유로 초대장을 전달해보세요.",
  copyLink: "링크 복사",
  shareLink: "링크 공유",
  openPreview: "미리보기 열기",
  linkCopied: "복사 완료",
  alertTitleRequired: "제목을 입력해 주세요.",
  alertPlaceRequired: "장소를 입력해 주세요.",
  alertImageTooLarge: "이미지 파일이 너무 큽니다. 12MB 이하 파일을 선택해 주세요.",
  alertImageUnsupported: "이미지 형식이 지원되지 않거나 변환에 실패했습니다. 다른 사진으로 다시 시도해 주세요.",
  alertPayloadTooLarge: "사진 용량이 너무 큽니다. 더 작은 사진으로 다시 시도해 주세요.",
  alertCreateFailed: "초대 링크 생성에 실패했습니다. 다시 시도해 주세요.",
  acceptHeading: "초대장이 도착했습니다.",
  acceptSubheading: "수락하시겠습니까?",
  yesLabel: "네! 좋아요",
  acceptInviteLabel: "초대 수락하기",
  noLabel: "아니요",
  expiredTitle: "만료된 초대장이에요.",
  expiredDesc: "새 초대장을 만들어 다시 공유해 주세요.",
  loading: "불러오는 중...",
  notAcceptedTitle: "아직 수락되지 않았어요",
  notAcceptedDesc: "수락 페이지로 다시 이동해 주세요.",
  goToAccept: "수락 페이지로 이동",
  photoNotice: "초대장 정보 및 해당 사진은 약속 날짜 이후 전부 삭제됩니다.",
  createOwn: "나도 초대장 만들기",
  createInvitation: "초대장 만들기",
  datePlaceholder: "날짜를 입력해 주세요.",
  timePlaceholder: "시간을 입력해 주세요.",
  placePlaceholder: "장소를 입력해 주세요.",
  adPlaceholderText: "광고주님 자리입니다. 문의는 클릭해 주세요!",
  adContactTitle: "광고 문의",
  adCreatedCount: "생성된 초대장 수:",
  adAcceptedCount: "초대장을 수락한 사용자 수:",
  adClose: "닫기",
  adEmailCopied: "복사 완료",
};

// ─── English ──────────────────────────────────────────────────────────────────

const en: Translations = {
  themeLabels: {
    "promise": "Hangout",
    "weekend-date": "Weekend Date",
    "birthday": "Birthday",
    "childrens-day": "Children's Day",
    "samgyeopsal-day": "Samgyeopsal Day",
    "white-day": "White Day",
    "valentine": "Valentine's Day",
    "christmas": "Christmas",
    "pepero": "Pepero Day",
    "lunar-new-year": "Lunar New Year",
    "chuseok": "Chuseok",
  },
  sendButton: "Send Invitation",
  placePlaceholders: ["Central Park", "Times Square", "Brooklyn Bridge", "The High Line", "Grand Central"],
  photoHint: "Tap the photo to change the image.",
  inviteModalTitle: "Invitation link created!",
  inviteModalDesc: "Share the link to send your invitation.",
  copyLink: "Copy Link",
  shareLink: "Share Link",
  openPreview: "Open Preview",
  linkCopied: "Copied!",
  alertTitleRequired: "Please enter a title.",
  alertPlaceRequired: "Please enter a location.",
  alertImageTooLarge: "File is too large. Please select a file under 12MB.",
  alertImageUnsupported: "Unsupported image format. Please try a different photo.",
  alertPayloadTooLarge: "Photo is too large. Please try a smaller photo.",
  alertCreateFailed: "Failed to create invitation link. Please try again.",
  acceptHeading: "You've got an invitation!",
  acceptSubheading: "Will you accept?",
  yesLabel: "Yes, I'm in!",
  acceptInviteLabel: "Accept Invitation",
  noLabel: "No",
  expiredTitle: "This invitation has expired.",
  expiredDesc: "Please create a new invitation and share again.",
  loading: "Loading...",
  notAcceptedTitle: "Not yet accepted",
  notAcceptedDesc: "Please go back to the accept page.",
  goToAccept: "Go to Accept Page",
  photoNotice: "Invitation details and photos will be deleted after the event date.",
  createOwn: "Create my own invitation",
  createInvitation: "Create Invitation",
  datePlaceholder: "Enter a date.",
  timePlaceholder: "Enter a time.",
  placePlaceholder: "Enter a location.",
  adPlaceholderText: "Your ad could be here. Click to inquire!",
  adContactTitle: "Advertise with us",
  adCreatedCount: "Invitations created:",
  adAcceptedCount: "Invitations accepted:",
  adClose: "Close",
  adEmailCopied: "Copied!",
};

// ─── Japanese ─────────────────────────────────────────────────────────────────

const ja: Translations = {
  themeLabels: {
    "promise": "友達の約束",
    "weekend-date": "週末デート",
    "birthday": "誕生日",
    "childrens-day": "こどもの日",
    "samgyeopsal-day": "サムギョプサルデー",
    "white-day": "ホワイトデー",
    "valentine": "バレンタインデー",
    "christmas": "クリスマス",
    "pepero": "ペペロデー",
    "lunar-new-year": "旧正月",
    "chuseok": "チュソク",
  },
  sendButton: "招待状を送る",
  placePlaceholders: ["渋谷スクランブル交差点", "新宿御苑", "東京タワー", "浅草寺", "秋葉原"],
  photoHint: "写真をタップして画像を変更できます。",
  inviteModalTitle: "招待リンクが生成されました",
  inviteModalDesc: "リンクを共有して招待状を送りましょう。",
  copyLink: "リンクをコピー",
  shareLink: "リンクを共有",
  openPreview: "プレビューを開く",
  linkCopied: "コピーしました",
  alertTitleRequired: "タイトルを入力してください。",
  alertPlaceRequired: "場所を入力してください。",
  alertImageTooLarge: "画像ファイルが大きすぎます。12MB以下のファイルを選択してください。",
  alertImageUnsupported: "対応していない画像形式です。別の写真をお試しください。",
  alertPayloadTooLarge: "写真が大きすぎます。小さい写真でお試しください。",
  alertCreateFailed: "招待リンクの作成に失敗しました。もう一度お試しください。",
  acceptHeading: "招待状が届きました。",
  acceptSubheading: "承認しますか？",
  yesLabel: "はい！行きます！",
  acceptInviteLabel: "招待を承認する",
  noLabel: "いいえ",
  expiredTitle: "この招待状は期限切れです。",
  expiredDesc: "新しい招待状を作成して共有してください。",
  loading: "読み込み中...",
  notAcceptedTitle: "まだ承認されていません",
  notAcceptedDesc: "承認ページに戻ってください。",
  goToAccept: "承認ページへ",
  photoNotice: "招待状の情報と写真は、約束の日付以降に削除されます。",
  createOwn: "私も招待状を作る",
  createInvitation: "招待状を作る",
  datePlaceholder: "日付を入力してください。",
  timePlaceholder: "時間を入力してください。",
  placePlaceholder: "場所を入力してください。",
  adPlaceholderText: "広告スペースです。お問い合わせはクリック！",
  adContactTitle: "広告のお問い合わせ",
  adCreatedCount: "作成された招待状の数:",
  adAcceptedCount: "招待を承認したユーザー数:",
  adClose: "閉じる",
  adEmailCopied: "コピーしました",
};

// ─── Chinese (Simplified) ─────────────────────────────────────────────────────

const zh: Translations = {
  themeLabels: {
    "promise": "朋友约会",
    "weekend-date": "周末约会",
    "birthday": "生日",
    "childrens-day": "儿童节",
    "samgyeopsal-day": "五花肉日",
    "white-day": "白色情人节",
    "valentine": "情人节",
    "christmas": "圣诞节",
    "pepero": "Pepero Day",
    "lunar-new-year": "农历新年",
    "chuseok": "中秋节",
  },
  sendButton: "发送邀请函",
  placePlaceholders: ["西湖", "天安门广场", "外滩", "故宫", "三里屯"],
  photoHint: "点击照片可以更换图片。",
  inviteModalTitle: "邀请链接已生成",
  inviteModalDesc: "分享链接来发送您的邀请函。",
  copyLink: "复制链接",
  shareLink: "分享链接",
  openPreview: "打开预览",
  linkCopied: "已复制",
  alertTitleRequired: "请输入标题。",
  alertPlaceRequired: "请输入地点。",
  alertImageTooLarge: "图片文件太大，请选择12MB以下的文件。",
  alertImageUnsupported: "不支持的图片格式，请尝试其他照片。",
  alertPayloadTooLarge: "照片太大，请尝试更小的照片。",
  alertCreateFailed: "创建邀请链接失败，请重试。",
  acceptHeading: "您收到了一封邀请函！",
  acceptSubheading: "您是否接受？",
  yesLabel: "好的！我去！",
  acceptInviteLabel: "接受邀请",
  noLabel: "不了",
  expiredTitle: "此邀请函已过期。",
  expiredDesc: "请创建新的邀请函并重新分享。",
  loading: "加载中...",
  notAcceptedTitle: "尚未接受",
  notAcceptedDesc: "请返回接受页面。",
  goToAccept: "前往接受页面",
  photoNotice: "邀请函信息和照片将在约定日期后删除。",
  createOwn: "我也来创建邀请函",
  createInvitation: "创建邀请函",
  datePlaceholder: "请输入日期。",
  timePlaceholder: "请输入时间。",
  placePlaceholder: "请输入地点。",
  adPlaceholderText: "广告位招募中，点击联系我们！",
  adContactTitle: "广告合作",
  adCreatedCount: "已创建的邀请函数量:",
  adAcceptedCount: "已接受邀请的用户数:",
  adClose: "关闭",
  adEmailCopied: "已复制",
};

// ─── Indonesian ───────────────────────────────────────────────────────────────

const id: Translations = {
  themeLabels: {
    "promise": "Janji Teman",
    "weekend-date": "Kencan Akhir Pekan",
    "birthday": "Ulang Tahun",
    "childrens-day": "Hari Anak",
    "samgyeopsal-day": "Hari Samgyeopsal",
    "white-day": "Hari Putih",
    "valentine": "Hari Valentine",
    "christmas": "Natal",
    "pepero": "Hari Pepero",
    "lunar-new-year": "Tahun Baru Imlek",
    "chuseok": "Chuseok",
  },
  sendButton: "Kirim Undangan",
  placePlaceholders: ["Monas", "Kota Tua", "Ancol", "Bundaran HI", "Taman Mini"],
  photoHint: "Ketuk foto untuk mengubah gambar.",
  inviteModalTitle: "Tautan undangan telah dibuat!",
  inviteModalDesc: "Bagikan tautan untuk mengirim undangan Anda.",
  copyLink: "Salin Tautan",
  shareLink: "Bagikan Tautan",
  openPreview: "Buka Pratinjau",
  linkCopied: "Disalin!",
  alertTitleRequired: "Silakan masukkan judul.",
  alertPlaceRequired: "Silakan masukkan lokasi.",
  alertImageTooLarge: "File terlalu besar. Pilih file di bawah 12MB.",
  alertImageUnsupported: "Format gambar tidak didukung. Coba foto lain.",
  alertPayloadTooLarge: "Foto terlalu besar. Coba foto yang lebih kecil.",
  alertCreateFailed: "Gagal membuat tautan undangan. Coba lagi.",
  acceptHeading: "Anda mendapat undangan!",
  acceptSubheading: "Apakah Anda menerima?",
  yesLabel: "Ya, saya ikut!",
  acceptInviteLabel: "Terima Undangan",
  noLabel: "Tidak",
  expiredTitle: "Undangan ini telah kedaluwarsa.",
  expiredDesc: "Buat undangan baru dan bagikan lagi.",
  loading: "Memuat...",
  notAcceptedTitle: "Belum diterima",
  notAcceptedDesc: "Silakan kembali ke halaman terima.",
  goToAccept: "Ke Halaman Terima",
  photoNotice: "Detail undangan dan foto akan dihapus setelah tanggal acara.",
  createOwn: "Buat undangan saya sendiri",
  createInvitation: "Buat Undangan",
  datePlaceholder: "Masukkan tanggal.",
  timePlaceholder: "Masukkan waktu.",
  placePlaceholder: "Masukkan lokasi.",
  adPlaceholderText: "Ruang iklan tersedia. Klik untuk info!",
  adContactTitle: "Pasang Iklan",
  adCreatedCount: "Undangan dibuat:",
  adAcceptedCount: "Undangan diterima:",
  adClose: "Tutup",
  adEmailCopied: "Disalin!",
};

// ─── Spanish ──────────────────────────────────────────────────────────────────

const es: Translations = {
  themeLabels: {
    "promise": "Quedada con Amigos",
    "weekend-date": "Cita de Fin de Semana",
    "birthday": "Cumpleaños",
    "childrens-day": "Día del Niño",
    "samgyeopsal-day": "Día Samgyeopsal",
    "white-day": "Día Blanco",
    "valentine": "San Valentín",
    "christmas": "Navidad",
    "pepero": "Día Pepero",
    "lunar-new-year": "Año Nuevo Lunar",
    "chuseok": "Chuseok",
  },
  sendButton: "Enviar Invitación",
  placePlaceholders: ["Plaza Mayor", "Sagrada Familia", "Parque del Retiro", "Las Ramblas", "Puerta del Sol"],
  photoHint: "Toca la foto para cambiar la imagen.",
  inviteModalTitle: "¡Enlace de invitación creado!",
  inviteModalDesc: "Comparte el enlace para enviar tu invitación.",
  copyLink: "Copiar Enlace",
  shareLink: "Compartir Enlace",
  openPreview: "Abrir Vista Previa",
  linkCopied: "¡Copiado!",
  alertTitleRequired: "Por favor, ingresa un título.",
  alertPlaceRequired: "Por favor, ingresa una ubicación.",
  alertImageTooLarge: "El archivo es demasiado grande. Selecciona un archivo menor de 12MB.",
  alertImageUnsupported: "Formato de imagen no compatible. Prueba con otra foto.",
  alertPayloadTooLarge: "La foto es demasiado grande. Prueba con una foto más pequeña.",
  alertCreateFailed: "Error al crear el enlace de invitación. Inténtalo de nuevo.",
  acceptHeading: "¡Has recibido una invitación!",
  acceptSubheading: "¿Aceptas?",
  yesLabel: "¡Sí, voy!",
  acceptInviteLabel: "Aceptar Invitación",
  noLabel: "No",
  expiredTitle: "Esta invitación ha caducado.",
  expiredDesc: "Crea una nueva invitación y compártela de nuevo.",
  loading: "Cargando...",
  notAcceptedTitle: "Aún no aceptada",
  notAcceptedDesc: "Por favor, vuelve a la página de aceptación.",
  goToAccept: "Ir a la Página de Aceptación",
  photoNotice: "Los detalles de la invitación y las fotos se eliminarán después de la fecha del evento.",
  createOwn: "Crear mi propia invitación",
  createInvitation: "Crear Invitación",
  datePlaceholder: "Ingresa una fecha.",
  timePlaceholder: "Ingresa una hora.",
  placePlaceholder: "Ingresa una ubicación.",
  adPlaceholderText: "¡Espacio publicitario disponible! Haz clic para consultar.",
  adContactTitle: "Publicidad",
  adCreatedCount: "Invitaciones creadas:",
  adAcceptedCount: "Invitaciones aceptadas:",
  adClose: "Cerrar",
  adEmailCopied: "¡Copiado!",
};

// ─── Arabic ───────────────────────────────────────────────────────────────────

const ar: Translations = {
  themeLabels: {
    "promise": "لقاء مع أصدقاء",
    "weekend-date": "موعد نهاية الأسبوع",
    "birthday": "عيد ميلاد",
    "childrens-day": "يوم الطفل",
    "samgyeopsal-day": "يوم سامغيوبسال",
    "white-day": "اليوم الأبيض",
    "valentine": "عيد الحب",
    "christmas": "عيد الميلاد",
    "pepero": "يوم بيبيرو",
    "lunar-new-year": "رأس السنة القمرية",
    "chuseok": "تشوسوك",
  },
  sendButton: "إرسال الدعوة",
  placePlaceholders: ["برج خليفة", "البيت الحرام", "الأهرامات", "برج القاهرة", "الحي التاريخي"],
  photoHint: "اضغط على الصورة لتغييرها.",
  inviteModalTitle: "تم إنشاء رابط الدعوة!",
  inviteModalDesc: "شارك الرابط لإرسال دعوتك.",
  copyLink: "نسخ الرابط",
  shareLink: "مشاركة الرابط",
  openPreview: "فتح المعاينة",
  linkCopied: "تم النسخ!",
  alertTitleRequired: "الرجاء إدخال عنوان.",
  alertPlaceRequired: "الرجاء إدخال موقع.",
  alertImageTooLarge: "الملف كبير جدًا. يرجى اختيار ملف أقل من 12MB.",
  alertImageUnsupported: "صيغة الصورة غير مدعومة. جرب صورة أخرى.",
  alertPayloadTooLarge: "الصورة كبيرة جدًا. جرب صورة أصغر.",
  alertCreateFailed: "فشل إنشاء رابط الدعوة. حاول مرة أخرى.",
  acceptHeading: "لديك دعوة!",
  acceptSubheading: "هل تقبل؟",
  yesLabel: "نعم، سأحضر!",
  acceptInviteLabel: "قبول الدعوة",
  noLabel: "لا",
  expiredTitle: "انتهت صلاحية هذه الدعوة.",
  expiredDesc: "يرجى إنشاء دعوة جديدة ومشاركتها مرة أخرى.",
  loading: "جارٍ التحميل...",
  notAcceptedTitle: "لم يتم القبول بعد",
  notAcceptedDesc: "يرجى العودة إلى صفحة القبول.",
  goToAccept: "الذهاب إلى صفحة القبول",
  photoNotice: "سيتم حذف تفاصيل الدعوة والصور بعد تاريخ الحدث.",
  createOwn: "إنشاء دعوتي الخاصة",
  createInvitation: "إنشاء دعوة",
  datePlaceholder: "أدخل تاريخًا.",
  timePlaceholder: "أدخل وقتًا.",
  placePlaceholder: "أدخل موقعًا.",
  adPlaceholderText: "مساحة إعلانية متاحة. انقر للاستفسار!",
  adContactTitle: "الإعلان معنا",
  adCreatedCount: "الدعوات المُنشأة:",
  adAcceptedCount: "الدعوات المقبولة:",
  adClose: "إغلاق",
  adEmailCopied: "تم النسخ!",
};

// ─── French ───────────────────────────────────────────────────────────────────

const fr: Translations = {
  themeLabels: {
    "promise": "Rendez-vous entre amis",
    "weekend-date": "Rendez-vous du week-end",
    "birthday": "Anniversaire",
    "childrens-day": "Fête des enfants",
    "samgyeopsal-day": "Jour Samgyeopsal",
    "white-day": "Jour Blanc",
    "valentine": "Saint-Valentin",
    "christmas": "Noël",
    "pepero": "Jour Pepero",
    "lunar-new-year": "Nouvel An lunaire",
    "chuseok": "Chuseok",
  },
  sendButton: "Envoyer l'Invitation",
  placePlaceholders: ["Tour Eiffel", "Champs-Élysées", "Musée du Louvre", "Sacré-Cœur", "Place de la République"],
  photoHint: "Appuyez sur la photo pour changer l'image.",
  inviteModalTitle: "Lien d'invitation créé !",
  inviteModalDesc: "Partagez le lien pour envoyer votre invitation.",
  copyLink: "Copier le lien",
  shareLink: "Partager le lien",
  openPreview: "Ouvrir l'aperçu",
  linkCopied: "Copié !",
  alertTitleRequired: "Veuillez saisir un titre.",
  alertPlaceRequired: "Veuillez saisir un lieu.",
  alertImageTooLarge: "Fichier trop volumineux. Choisissez un fichier inférieur à 12 Mo.",
  alertImageUnsupported: "Format d'image non pris en charge. Essayez une autre photo.",
  alertPayloadTooLarge: "Photo trop volumineuse. Essayez une photo plus petite.",
  alertCreateFailed: "Échec de la création du lien. Réessayez.",
  acceptHeading: "Vous avez reçu une invitation !",
  acceptSubheading: "Acceptez-vous ?",
  yesLabel: "Oui, j'y vais !",
  acceptInviteLabel: "Accepter l'Invitation",
  noLabel: "Non",
  expiredTitle: "Cette invitation a expiré.",
  expiredDesc: "Veuillez créer une nouvelle invitation et la partager à nouveau.",
  loading: "Chargement...",
  notAcceptedTitle: "Pas encore acceptée",
  notAcceptedDesc: "Veuillez retourner à la page d'acceptation.",
  goToAccept: "Aller à la page d'acceptation",
  photoNotice: "Les détails et photos seront supprimés après la date de l'événement.",
  createOwn: "Créer ma propre invitation",
  createInvitation: "Créer une Invitation",
  datePlaceholder: "Saisir une date.",
  timePlaceholder: "Saisir une heure.",
  placePlaceholder: "Saisir un lieu.",
  adPlaceholderText: "Espace publicitaire disponible. Cliquez pour vous renseigner !",
  adContactTitle: "Publicité",
  adCreatedCount: "Invitations créées :",
  adAcceptedCount: "Invitations acceptées :",
  adClose: "Fermer",
  adEmailCopied: "Copié !",
};

// ─── Russian ──────────────────────────────────────────────────────────────────

const ru: Translations = {
  themeLabels: {
    "promise": "Встреча с друзьями",
    "weekend-date": "Свидание на выходных",
    "birthday": "День рождения",
    "childrens-day": "День детей",
    "samgyeopsal-day": "День самгёпсаль",
    "white-day": "Белый день",
    "valentine": "День Святого Валентина",
    "christmas": "Рождество",
    "pepero": "День Пеперо",
    "lunar-new-year": "Лунный Новый год",
    "chuseok": "Чхусок",
  },
  sendButton: "Отправить Приглашение",
  placePlaceholders: ["Красная площадь", "Арбат", "Парк Горького", "ВДНХ", "Поклонная гора"],
  photoHint: "Нажмите на фото, чтобы изменить изображение.",
  inviteModalTitle: "Ссылка на приглашение создана!",
  inviteModalDesc: "Поделитесь ссылкой, чтобы отправить приглашение.",
  copyLink: "Копировать ссылку",
  shareLink: "Поделиться ссылкой",
  openPreview: "Открыть предпросмотр",
  linkCopied: "Скопировано!",
  alertTitleRequired: "Пожалуйста, введите заголовок.",
  alertPlaceRequired: "Пожалуйста, введите место.",
  alertImageTooLarge: "Файл слишком большой. Выберите файл менее 12 МБ.",
  alertImageUnsupported: "Неподдерживаемый формат. Попробуйте другую фотографию.",
  alertPayloadTooLarge: "Фото слишком большое. Попробуйте фото поменьше.",
  alertCreateFailed: "Не удалось создать ссылку. Попробуйте снова.",
  acceptHeading: "Вы получили приглашение!",
  acceptSubheading: "Вы принимаете?",
  yesLabel: "Да, я иду!",
  acceptInviteLabel: "Принять Приглашение",
  noLabel: "Нет",
  expiredTitle: "Это приглашение истекло.",
  expiredDesc: "Создайте новое приглашение и поделитесь им снова.",
  loading: "Загрузка...",
  notAcceptedTitle: "Ещё не принято",
  notAcceptedDesc: "Пожалуйста, вернитесь на страницу принятия.",
  goToAccept: "Перейти на страницу принятия",
  photoNotice: "Детали приглашения и фото будут удалены после даты мероприятия.",
  createOwn: "Создать своё приглашение",
  createInvitation: "Создать Приглашение",
  datePlaceholder: "Введите дату.",
  timePlaceholder: "Введите время.",
  placePlaceholder: "Введите место.",
  adPlaceholderText: "Рекламное место. Нажмите для связи!",
  adContactTitle: "Реклама",
  adCreatedCount: "Создано приглашений:",
  adAcceptedCount: "Принято приглашений:",
  adClose: "Закрыть",
  adEmailCopied: "Скопировано!",
};

// ─── Portuguese ───────────────────────────────────────────────────────────────

const pt: Translations = {
  themeLabels: {
    "promise": "Encontro com Amigos",
    "weekend-date": "Encontro de Fim de Semana",
    "birthday": "Aniversário",
    "childrens-day": "Dia das Crianças",
    "samgyeopsal-day": "Dia Samgyeopsal",
    "white-day": "Dia Branco",
    "valentine": "Dia dos Namorados",
    "christmas": "Natal",
    "pepero": "Dia Pepero",
    "lunar-new-year": "Ano Novo Lunar",
    "chuseok": "Chuseok",
  },
  sendButton: "Enviar Convite",
  placePlaceholders: ["Cristo Redentor", "Copacabana", "Parque Ibirapuera", "Pelourinho", "Largo do Arouche"],
  photoHint: "Toque na foto para alterar a imagem.",
  inviteModalTitle: "Link do convite criado!",
  inviteModalDesc: "Compartilhe o link para enviar seu convite.",
  copyLink: "Copiar Link",
  shareLink: "Compartilhar Link",
  openPreview: "Abrir Pré-visualização",
  linkCopied: "Copiado!",
  alertTitleRequired: "Por favor, insira um título.",
  alertPlaceRequired: "Por favor, insira um local.",
  alertImageTooLarge: "Arquivo muito grande. Selecione um arquivo abaixo de 12MB.",
  alertImageUnsupported: "Formato de imagem não suportado. Tente outra foto.",
  alertPayloadTooLarge: "Foto muito grande. Tente uma foto menor.",
  alertCreateFailed: "Falha ao criar link do convite. Tente novamente.",
  acceptHeading: "Você recebeu um convite!",
  acceptSubheading: "Você aceita?",
  yesLabel: "Sim, vou!",
  acceptInviteLabel: "Aceitar Convite",
  noLabel: "Não",
  expiredTitle: "Este convite expirou.",
  expiredDesc: "Por favor, crie um novo convite e compartilhe novamente.",
  loading: "Carregando...",
  notAcceptedTitle: "Ainda não aceito",
  notAcceptedDesc: "Por favor, volte à página de aceitação.",
  goToAccept: "Ir para Página de Aceitação",
  photoNotice: "Os detalhes do convite e as fotos serão excluídos após a data do evento.",
  createOwn: "Criar meu próprio convite",
  createInvitation: "Criar Convite",
  datePlaceholder: "Insira uma data.",
  timePlaceholder: "Insira um horário.",
  placePlaceholder: "Insira um local.",
  adPlaceholderText: "Espaço publicitário disponível. Clique para saber mais!",
  adContactTitle: "Publicidade",
  adCreatedCount: "Convites criados:",
  adAcceptedCount: "Convites aceitos:",
  adClose: "Fechar",
  adEmailCopied: "Copiado!",
};

// ─── German ───────────────────────────────────────────────────────────────────

const de: Translations = {
  themeLabels: {
    "promise": "Freundestreffen",
    "weekend-date": "Wochenend-Date",
    "birthday": "Geburtstag",
    "childrens-day": "Kindertag",
    "samgyeopsal-day": "Samgyeopsal-Tag",
    "white-day": "Weißer Tag",
    "valentine": "Valentinstag",
    "christmas": "Weihnachten",
    "pepero": "Pepero-Tag",
    "lunar-new-year": "Chinesisches Neujahr",
    "chuseok": "Chuseok",
  },
  sendButton: "Einladung Senden",
  placePlaceholders: ["Brandenburger Tor", "Alexanderplatz", "Tiergarten", "Kurfürstendamm", "Museumsinsel"],
  photoHint: "Tippen Sie auf das Foto, um das Bild zu ändern.",
  inviteModalTitle: "Einladungslink erstellt!",
  inviteModalDesc: "Teilen Sie den Link, um Ihre Einladung zu senden.",
  copyLink: "Link kopieren",
  shareLink: "Link teilen",
  openPreview: "Vorschau öffnen",
  linkCopied: "Kopiert!",
  alertTitleRequired: "Bitte geben Sie einen Titel ein.",
  alertPlaceRequired: "Bitte geben Sie einen Ort ein.",
  alertImageTooLarge: "Datei zu groß. Bitte wählen Sie eine Datei unter 12 MB.",
  alertImageUnsupported: "Nicht unterstütztes Bildformat. Versuchen Sie ein anderes Foto.",
  alertPayloadTooLarge: "Foto zu groß. Versuchen Sie ein kleineres Foto.",
  alertCreateFailed: "Einladungslink konnte nicht erstellt werden. Bitte erneut versuchen.",
  acceptHeading: "Sie haben eine Einladung erhalten!",
  acceptSubheading: "Nehmen Sie an?",
  yesLabel: "Ja, ich komme!",
  acceptInviteLabel: "Einladung Annehmen",
  noLabel: "Nein",
  expiredTitle: "Diese Einladung ist abgelaufen.",
  expiredDesc: "Bitte erstellen Sie eine neue Einladung und teilen Sie sie erneut.",
  loading: "Laden...",
  notAcceptedTitle: "Noch nicht angenommen",
  notAcceptedDesc: "Bitte gehen Sie zurück zur Annahmeseite.",
  goToAccept: "Zur Annahmeseite",
  photoNotice: "Einladungsdetails und Fotos werden nach dem Veranstaltungsdatum gelöscht.",
  createOwn: "Meine eigene Einladung erstellen",
  createInvitation: "Einladung Erstellen",
  datePlaceholder: "Datum eingeben.",
  timePlaceholder: "Uhrzeit eingeben.",
  placePlaceholder: "Ort eingeben.",
  adPlaceholderText: "Werbefläche verfügbar. Klicken Sie für Anfragen!",
  adContactTitle: "Werbung",
  adCreatedCount: "Erstellte Einladungen:",
  adAcceptedCount: "Angenommene Einladungen:",
  adClose: "Schließen",
  adEmailCopied: "Kopiert!",
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ["ko", "en", "ja", "zh", "id", "es", "ar", "fr", "ru", "pt", "de"] as const;
export type LocaleKey = (typeof SUPPORTED_LOCALES)[number];

export function getTranslations(locale: string): Translations {
  if (locale === "en") return en;
  if (locale === "ja") return ja;
  if (locale === "zh") return zh;
  if (locale === "id") return id;
  if (locale === "es") return es;
  if (locale === "ar") return ar;
  if (locale === "fr") return fr;
  if (locale === "ru") return ru;
  if (locale === "pt") return pt;
  if (locale === "de") return de;
  return ko;
}
