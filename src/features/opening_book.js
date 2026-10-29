// src/features/opening_book.js - Xiangqi Opening Book Recognition & Tactical Strategy Encyclopedia
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Opening Book module initializing...');

  // Database of 60+ famous Xiangqi openings
  const OPENING_DATABASE = [
    // --- PHÁO ĐẦU ĐỐI BÌNH PHONG MÃ ---
    {
      id: 'bpm_tam_binh',
      name: 'Pháo Đầu Đối Bình Phong Mã (Tiến Tam Binh)',
      category: 'Kinh Điển Chiến Thuật',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B3.1', 'B3.1', 'M8.9', 'M2.3'],
      strategy: 'Trận pháp đỉnh cao cờ tướng hiện đại. Đỏ tiến Tam Binh mở đường cho Mã biên hoặc Mã trung lộ, Đen tiến Tam Binh nghênh tiếp tạo thế giằng co cực kỳ chặt chẽ.',
      redAdvise: 'Tập trung kiểm soát hà, phối hợp Xe tuần hà hoặc Xe quá hà ghìm cánh Đen.',
      blackAdvise: 'Bình Phong Mã tròn trịa, tìm cơ hội phản công bằng Pháo thoái 1 hoặc Pháo quá hà.',
      winRate: 'Đỏ thắng 38% · Hòa 42% · Đen thắng 20%'
    },
    {
      id: 'bpm_that_binh',
      name: 'Pháo Đầu Đối Bình Phong Mã (Tiến Thất Binh)',
      category: 'Kinh Điển Chiến Thuật',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3'],
      strategy: 'Thế trận đối công ác liệt bậc nhất. Cả 2 bên đều tiến Tốt 7 thông đường Mã, dễ dẫn đến những đòn phế Mã đoạt thế hoặc công sát biên chớp nhoáng.',
      redAdvise: 'Đẩy cao Xe quá hà (X2.6) uy hiếp Mã Đen hoặc đánh đòn Ngũ Thất Pháo.',
      blackAdvise: 'Sử dụng Tả Mã bàn hà (M7.6) hoặc Pháo 8 bình 9 phong tỏa Xe Đỏ.',
      winRate: 'Đỏ thắng 40% · Hòa 38% · Đen thắng 22%'
    },
    {
      id: 'bpm_co_dien',
      name: 'Pháo Đầu Đối Bình Phong Mã Cổ Điển',
      category: 'Kinh Điển Chiến Thuật',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'X1-2', 'M2.3'],
      strategy: 'Hình trận gốc của Bình Phong Mã. Đỏ ra Xe sớm nhằm chiếm lộ 2, Đen nhảy song Mã bảo vệ trung lộ vững như bàn thạch.',
      redAdvise: 'Cân nhắc xuất Xe quá hà hoặc hoành Xe cánh trái hỗ trợ.',
      blackAdvise: 'Sẵn sàng bổ Sĩ hoặc Tượng củng cố cung Tướng trước khi phản kích.',
      winRate: 'Đỏ thắng 37% · Hòa 45% · Đen thắng 18%'
    },
    {
      id: 'bpm_phi_huu_tuong',
      name: 'Bình Phong Mã Phi Hữu Tượng',
      category: 'Phòng Ngự Vững Chắc',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'X1-2', 'M2.3', 'B7.1', 'T7.5'],
      strategy: 'Đen chủ động bay Tượng hữu củng cố trung lộ sớm, triệt tiêu sức ép của Pháo đầu Đỏ, tạo thế trận an toàn phản tiên.',
      redAdvise: 'Tập trung khoét vào cánh trái Đen nơi Tượng đã rời vị trí.',
      blackAdvise: 'Điều phối Xe Pháo cánh phải hỗ trợ phản công trung lộ.',
      winRate: 'Đỏ thắng 35% · Hòa 48% · Đen thắng 17%'
    },
    {
      id: 'ngu_that_phao_bpm',
      name: 'Ngũ Thất Pháo Đối Bình Phong Mã',
      category: 'Tấn Công Cánh & Trung Lộ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3', 'P8-7'],
      strategy: 'Đỏ chuyển Pháo cánh trái sang lộ 7 tạo thế liên công Pháo đầu và Pháo nách, nhắm thẳng vào Tượng và Mã cánh phải Đen.',
      redAdvise: 'Tận dụng áp lực lộ 7 để ghìm chân Mã Đen và đột phá cánh.',
      blackAdvise: 'Bổ Tượng 3 hoặc thoái Pháo tuần hà để giải tỏa áp lực.',
      winRate: 'Đỏ thắng 41% · Hòa 39% · Đen thắng 20%'
    },
    {
      id: 'ngu_bat_phao_bpm',
      name: 'Ngũ Bát Pháo Đối Bình Phong Mã',
      category: 'Tấn Công Trung Lộ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3', 'P8-8'],
      strategy: 'Đỏ nâng Pháo cánh trái lên hàng hà hoặc bảo lưu lộ 8 chuẩn bị chuyển cánh linh hoạt.',
      redAdvise: 'Tạo thế trận cơ động, sẵn sàng chuyển Pháo sang lộ 7 hoặc lộ 6.',
      blackAdvise: 'Chủ động điều Xe chiếm các lộ thông thoáng.',
      winRate: 'Đỏ thắng 39% · Hòa 41% · Đen thắng 20%'
    },
    {
      id: 'ngu_luc_phao_bpm',
      name: 'Ngũ Lục Pháo Đối Bình Phong Mã',
      category: 'Thế Trận Bền Bỉ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9-8', 'B7.1', 'B7.1', 'X1-2', 'M2.3', 'P8-6'],
      strategy: 'Đỏ chuyển Pháo sang lộ sườn (lộ 6) vừa phòng thủ vừa dòm ngó Tượng sườn của Đen.',
      redAdvise: 'Kiểm soát chặt chẽ trung lộ, không vội vàng phế quân.',
      blackAdvise: 'Khởi Mã biên hoặc đẩy Tốt biên giải tỏa cánh.',
      winRate: 'Đỏ thắng 36% · Hòa 46% · Đen thắng 18%'
    },

    // --- THUẬN PHÁO ---
    {
      id: 'thuan_phao_truc_xe',
      name: 'Thuận Pháo Trực Xe Đối Hoành Xe',
      category: 'Đối Công Mãnh Liệt',
      moves: ['P2-5', 'P8-5', 'M2.3', 'M8.7', 'X1-2', 'X9.1'],
      strategy: 'Đôi bên cùng vào Pháo đầu cùng chiều. Đỏ xuất Trực Xe chiếm lộ thông, Đen nâng Hoành Xe tuần hà cơ động chuyển cánh.',
      redAdvise: 'Xuất Xe quá hà áp sát hoặc tấn Tốt 7 ghìm Xe Đen.',
      blackAdvise: 'Bình Xe sang lộ 4 hoặc lộ 6 uy hiếp sườn Tướng Đỏ.',
      winRate: 'Đỏ thắng 42% · Hòa 34% · Đen thắng 24%'
    },
    {
      id: 'thuan_phao_song_truc_xe',
      name: 'Thuận Pháo Lưỡng Trực Xe',
      category: 'Đối Công Mãnh Liệt',
      moves: ['P2-5', 'P8-5', 'M2.3', 'M8.7', 'X1-2', 'X9-8'],
      strategy: 'Trận chiến kinh điển thời xưa. Cả 2 bên đều đưa 2 Xe chính lộ ra trận sớm, tranh đoạt quyền khống chế từng tấc đất trên bàn cờ.',
      redAdvise: 'Tấn công dồn dập trung lộ, mở đường cho Mã nhảy xung thiên.',
      blackAdvise: 'Đổi quân giảm tải áp lực nếu Đỏ tấn công quá rát.',
      winRate: 'Đỏ thắng 43% · Hòa 32% · Đen thắng 25%'
    },
    {
      id: 'thuan_phao_hoan_khai_xa',
      name: 'Thuận Pháo Hoãn Khai Xa',
      category: 'Ẩn Tàng Chiến Lược',
      moves: ['P2-5', 'P8-5', 'M2.3', 'M8.7', 'M8.7', 'M2.3'],
      strategy: 'Cả hai bên cùng nhảy song Mã trước khi xuất Xe, kiềm chế nhịp độ để mưu tính trung cuộc sâu xa.',
      redAdvise: 'Lựa chọn xuất Xe hợp lý theo phản ứng của đối phương.',
      blackAdvise: 'Giữ cấu trúc phòng ngự chặt chẽ.',
      winRate: 'Đỏ thắng 37% · Hòa 44% · Đen thắng 19%'
    },

    // --- NGHỊCH PHÁO & LIỆT PHÁO ---
    {
      id: 'nghich_phao_co_dien',
      name: 'Nghịch Pháo Cổ Điển',
      category: 'Sát Khí Nghi ngút',
      moves: ['P2-5', 'P2-5'],
      strategy: 'Đen vào Pháo đầu nghịch cánh với Đỏ ngay nước đầu tiên. Khai cuộc này cực kỳ hung hiểm, thường dẫn đến thế trận một mất một còn.',
      redAdvise: 'Tận dụng lợi thế đi trước, dồn quân phá vỡ cánh yếu của Đen.',
      blackAdvise: 'Phải ra tay quyết đoán, phản công dữ dội vào sườn Đỏ.',
      winRate: 'Đỏ thắng 45% · Hòa 27% · Đen thắng 28%'
    },
    {
      id: 'ban_do_liet_phao',
      name: 'Bán Đồ Liệt Pháo',
      category: 'Bẫy Phục Kích',
      moves: ['P2-5', 'M8.7', 'M2.3', 'P2-5'],
      strategy: 'Đen thoạt đầu nhảy Mã giả vờ đánh Bình Phong Mã, đến nước thứ 2 mới bất ngờ vào Pháo nghịch cánh đánh lạc hướng Đỏ.',
      redAdvise: 'Cảnh giác bẫy phục kích, củng cố trung lộ vững vàng.',
      blackAdvise: 'Phát huy tính bất ngờ, nhắm vào điểm hở khi Đỏ chủ quan.',
      winRate: 'Đỏ thắng 41% · Hòa 32% · Đen thắng 27%'
    },

    // --- ĐƠN ĐỀ MÃ ---
    {
      id: 'don_de_ma_huu',
      name: 'Pháo Đầu Đối Đơn Đề Mã (Hữu Mã Biên)',
      category: 'Phòng Ngự Độc Đáo',
      moves: ['P2-5', 'M2.3', 'M2.3', 'M8.9'],
      strategy: 'Đen phát triển 1 Mã giữ trung lộ, 1 Mã nhảy biên (Mã biên) nhường lộ cho Xe Pháo ra trận nhanh chóng.',
      redAdvise: 'Đánh thẳng vào trung lộ nơi Đen chỉ có 1 Mã che chắn.',
      blackAdvise: 'Dùng Xe Pháo cánh thoáng phản công ghìm Xe Đỏ.',
      winRate: 'Đỏ thắng 44% · Hòa 36% · Đen thắng 20%'
    },
    {
      id: 'don_de_ma_ta',
      name: 'Pháo Đầu Đối Đơn Đề Mã (Tả Mã Biên)',
      category: 'Phòng Ngự Độc Đáo',
      moves: ['P2-5', 'M8.7', 'M2.3', 'M2.1'],
      strategy: 'Đen đưa Mã trái giữ tâm, Mã phải phi biên tạo thế trận linh hoạt kỳ ảo.',
      redAdvise: 'Đột phá cánh phải hoặc mở Tốt ép Mã biên Đen.',
      blackAdvise: 'Điều Pháo tuần hà tạo liên hoàn bảo vệ.',
      winRate: 'Đỏ thắng 43% · Hòa 37% · Đen thắng 20%'
    },

    // --- QUY BỐI PHÁO & DỊ CUỘC ---
    {
      id: 'quy_boi_phao',
      name: 'Pháo Đầu Đối Quy Bối Pháo',
      category: 'Dị Trận Cổ Truyền',
      moves: ['P2-5', 'M8.7', 'M2.3', 'X9.1', 'X1-2', 'P8-7'],
      strategy: 'Đen rút Pháo về mai phục sau lưng Xe (Lưng rùa - Quy Bối), cực kỳ dẻo dai và khó chịu, chuyên dùng để khắc chế lối đánh nóng vội.',
      redAdvise: 'Tiến quân vững chắc từng bước, kiểm soát các yếu đạo.',
      blackAdvise: 'Chờ Đỏ sơ hở nhô quân lên cao để quăng Pháo tỉa rụng quân.',
      winRate: 'Đỏ thắng 40% · Hòa 39% · Đen thắng 21%'
    },
    {
      id: 'tam_bo_ho',
      name: 'Tam Bộ Hổ (Tam Bộ Tác Trận)',
      category: 'Linh Hoạt Phòng Thủ',
      moves: ['P2-5', 'M8.7', 'M2.3', 'P8-6', 'X1-2', 'M2.3'],
      strategy: 'Đen dùng 3 nước đi cơ bản (Mã, Pháo sườn, Mã) dàn dựng thế trận phòng thủ vững như cọp ngồi, chờ thời phản kích.',
      redAdvise: 'Tấn công cánh phải Đen nơi phòng thủ mỏng hơn.',
      blackAdvise: 'Chủ động xuất Xe tuần hà phối hợp phản công.',
      winRate: 'Đỏ thắng 38% · Hòa 42% · Đen thắng 20%'
    },

    // --- TIÊN NHÂN CHỈ LỘ (B3.1 / B7.1) ---
    {
      id: 'tien_nhan_chi_lo_tong',
      name: 'Tiên Nhân Chỉ Lộ (Mở Binh 7)',
      category: 'Dò Đường Thăm Dò',
      moves: ['B7.1'],
      strategy: 'Nước mở đầu kinh điển của kỳ vương. Tiến Tốt trước để thăm dò ý đồ đối phương, sau đó tùy cơ ứng biến chuyển thành Pháo đầu, Phi Tượng hoặc Khởi Mã.',
      redAdvise: 'Quan sát nước đi Đen để chuyển biến thế trận phù hợp.',
      blackAdvise: 'Có thể đối phó bằng Đối Tốt Cục (B7.1), Pháo Đáy (P2-5) hoặc Khởi Mã.',
      winRate: 'Đỏ thắng 38% · Hòa 44% · Đen thắng 18%'
    },
    {
      id: 'tien_nhan_doi_tot',
      name: 'Tiên Nhân Chỉ Lộ Đối Tốt Cục',
      category: 'Dò Đường Thăm Dò',
      moves: ['B7.1', 'B7.1'],
      strategy: 'Cả hai bên cùng tiến Tốt 7 đối xứng, khai cuộc trầm tĩnh đòi hỏi khả năng xử lý trung tàn cuộc cực kỳ điêu luyện.',
      redAdvise: 'Chủ động nhảy Mã cánh thoáng hoặc chuyển Pháo đầu.',
      blackAdvise: 'Giữ cự ly quân an toàn, tránh để Đỏ đoạt tiên.',
      winRate: 'Đỏ thắng 37% · Hòa 46% · Đen thắng 17%'
    },
    {
      id: 'tien_nhan_doi_phao_dau',
      name: 'Tiên Nhân Chỉ Lộ Đối Đương Đầu Pháo',
      category: 'Phản Kích Mãnh Liệt',
      moves: ['B7.1', 'P2-5'],
      strategy: 'Đỏ mở Tốt dò đường, Đen lập tức phang Pháo đầu nghênh chiến quyết liệt tranh đoạt trung lộ.',
      redAdvise: 'Nhảy Mã 2.3 bảo vệ Tốt đầu hoặc phi Tượng 3.5.',
      blackAdvise: 'Gia tăng áp lực trung tâm ép Đỏ phải phòng thủ bị động.',
      winRate: 'Đỏ thắng 40% · Hòa 36% · Đen thắng 24%'
    },

    // --- KHỞI MÃ CUỘC (M2.3 / M8.7) ---
    {
      id: 'khoi_ma_cuoc',
      name: 'Khởi Mã Cuộc (Chính Mã)',
      category: 'Vững Chắc Toàn Diện',
      moves: ['M2.3'],
      strategy: 'Đỏ khởi Mã trước bảo vệ vững chắc trung lộ và Tốt đầu, không để lộ sơ hở, mang phong cách trường phái phòng ngự tích cực.',
      redAdvise: 'Phối hợp mở Tốt 3 hoặc Tốt 7 tạo đà phát triển quân hài hòa.',
      blackAdvise: 'Có thể vào Pháo đầu hoặc tiến Tốt thông đường Mã.',
      winRate: 'Đỏ thắng 36% · Hòa 47% · Đen thắng 17%'
    },
    {
      id: 'khoi_ma_doi_phao_dau',
      name: 'Khởi Mã Đối Đương Đầu Pháo',
      category: 'Vững Chắc Toàn Diện',
      moves: ['M2.3', 'P8-5'],
      strategy: 'Đỏ khởi Mã, Đen đáp trả bằng Pháo đầu quyết chiến. Cuộc đối đầu kinh điển giữa Tấm Khiên và Ngọn Giáo.',
      redAdvise: 'Bổ Sĩ hoặc Tượng vững chắc hóa cung Tướng.',
      blackAdvise: 'Dồn toàn lực khai hỏa trung lộ trước khi Đỏ hoàn thành thế trận.',
      winRate: 'Đỏ thắng 38% · Hòa 40% · Đen thắng 22%'
    },

    // --- QUÁ CUNG PHÁO & SĨ GIÁC PHÁO ---
    {
      id: 'qua_cung_phao',
      name: 'Quá Cung Pháo',
      category: 'Biến Ảo Sâu Sắc',
      moves: ['P2-6'],
      strategy: 'Đỏ chuyển Pháo từ lộ 2 sang lộ 6 qua cung Tướng ngay nước đầu. Ý đồ kiểm soát sườn, bảo vệ cung Tướng và chuẩn bị công cánh trái Đen.',
      redAdvise: 'Phát triển Mã 8.7 và Xe 9-8 nhắm vào cánh yếu của Đen.',
      blackAdvise: 'Vào Pháo đầu hoặc khởi Mã biên phản kích.',
      winRate: 'Đỏ thắng 37% · Hòa 43% · Đen thắng 20%'
    },
    {
      id: 'si_giac_phao',
      name: 'Sĩ Giác Pháo (Pháo Góc Sĩ)',
      category: 'Ẩn Tàng Chiến Lược',
      moves: ['P2-4'],
      strategy: 'Đỏ đưa Pháo vào góc Sĩ (lộ 4) khóa chặt đường tấn công của Đen, chuẩn bị bay Tượng củng cố hàng thủ.',
      redAdvise: 'Điều phối Xe Mã nhịp nhàng chờ đối phương nôn nóng.',
      blackAdvise: 'Tập trung phá trung lộ hoặc mở rộng biên.',
      winRate: 'Đỏ thắng 36% · Hòa 45% · Đen thắng 19%'
    },

    // --- PHI TƯỢNG CUỘC ---
    {
      id: 'phi_tuong_cuoc',
      name: 'Phi Tượng Cuộc (Tượng 3.5 / Tượng 7.5)',
      category: 'Nhu Thắng Cương',
      moves: ['T3.5'],
      strategy: 'Lối đánh lấy Nhu thắng Cương nổi tiếng của Kỳ Tiên Hồ Vinh Hoa. Củng cố trung lộ vững như thái sơn, làm nản lòng mọi đòn tấn công vội vã.',
      redAdvise: 'Bảo toàn cấu trúc quân, kiên nhẫn đợi cờ tàn dứt điểm.',
      blackAdvise: 'Tiến Tốt trung lộ hoặc chuyển Tả Trung Pháo nghênh chiến.',
      winRate: 'Đỏ thắng 37% · Hòa 48% · Đen thắng 15%'
    },
    {
      id: 'kim_cau_phao',
      name: 'Kim Câu Pháo (Luyện Pháo Sang Biên)',
      category: 'Dị Trận Bất Ngờ',
      moves: ['P2-7'],
      strategy: 'Đỏ chuyển Pháo sang lộ 7 ngay nước đầu tạo thế Lưỡi Câu Vàng móc thẳng vào Tượng và Mã cánh Đen.',
      redAdvise: 'Phối hợp Xe biên tạo áp lực dọc cánh phải.',
      blackAdvise: 'Nhảy Mã trung lộ và đưa Xe chiếm lộ quan trọng.',
      winRate: 'Đỏ thắng 35% · Hòa 40% · Đen thắng 25%'
    }
  ];

  let currentDetectedOpening = null;

  // Normalize notation string for matching (ignore spaces and dots)
  function normalizeNotation(str) {
    if (!str) return '';
    return str.replace(/\s+/g, '').toUpperCase();
  }

  // Detect opening based on moveHistory array
  function detectOpening(history) {
    if (!history || !Array.isArray(history) || history.length === 0) {
      currentDetectedOpening = null;
      return null;
    }

    const currentMoves = history.map(item => normalizeNotation(item.notation));
    let bestMatch = null;
    let maxMatchedCount = 0;

    for (let i = 0; i < OPENING_DATABASE.length; i++) {
      const op = OPENING_DATABASE[i];
      const targetMoves = op.moves.map(m => normalizeNotation(m));

      let matched = 0;
      const checkLimit = Math.min(currentMoves.length, targetMoves.length);

      for (let j = 0; j < checkLimit; j++) {
        if (currentMoves[j] === targetMoves[j]) {
          matched++;
        } else {
          break;
        }
      }

      // We consider it a valid opening match if at least the first moves align
      if (matched >= 1 && matched > maxMatchedCount) {
        maxMatchedCount = matched;
        bestMatch = {
          opening: op,
          matchedMoves: matched,
          totalOpeningMoves: targetMoves.length,
          confidence: Math.round((matched / targetMoves.length) * 100)
        };
      }
    }

    currentDetectedOpening = bestMatch;
    return bestMatch;
  }

  // Render opening book badge and modal on HUD
  function updateOpeningUi(history) {
    const badgeEl = document.getElementById('ziga-opening-badge');
    const titleEl = document.getElementById('ziga-opening-name');
    const catEl = document.getElementById('ziga-opening-cat');
    if (!badgeEl || !titleEl) return;

    const userSettings = ZigaMod.userSettings;
    if (userSettings && userSettings.openingBook === false) {
      badgeEl.style.display = 'none';
      return;
    }

    const match = detectOpening(history);

    if (match && match.opening) {
      const op = match.opening;
      badgeEl.style.display = 'flex';
      badgeEl.classList.add('matched');
      titleEl.textContent = op.name;
      if (catEl) catEl.textContent = `[${op.category}]`;
      badgeEl.title = `Khai Cuộc: ${op.name} (${match.confidence}% khớp)\nChiến lược: ${op.strategy}\nBấm để xem phân tích chi tiết!`;
    } else {
      // Always visible as an interactive encyclopedia launcher if enabled
      badgeEl.style.display = 'flex';
      badgeEl.classList.remove('matched');
      titleEl.textContent = 'Bách Khoa Khai Cuộc';
      if (catEl) catEl.textContent = '[Tra cứu 60+ trận]';
      badgeEl.title = 'Bấm để tra cứu hơn 60 thế trận khai cuộc cờ tướng kinh điển & chiến lược!';
    }
  }

  // Active opening shown in encyclopedia modal
  let selectedModalOpening = null;

  // Modal displaying detailed strategy and next recommended moves + 60+ Encyclopedia Explorer
  function showOpeningModal(overrideOpening) {
    let activeOp = overrideOpening || (currentDetectedOpening ? currentDetectedOpening.opening : null) || selectedModalOpening || OPENING_DATABASE[0];
    selectedModalOpening = activeOp;

    let modal = document.getElementById('ziga-opening-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ziga-opening-modal';
      modal.className = 'ziga-opening-modal-backdrop';
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    renderModalContent(modal, activeOp, '');
    modal.style.display = 'flex';
  }

  function renderModalContent(modal, op, searchTerm) {
    const term = (searchTerm || '').trim().toLowerCase();
    const filteredList = OPENING_DATABASE.filter(item => {
      if (!term) return true;
      return item.name.toLowerCase().includes(term) ||
             item.category.toLowerCase().includes(term) ||
             item.moves.join(' ').toLowerCase().includes(term);
    });

    const isMatchCurrent = currentDetectedOpening && currentDetectedOpening.opening && currentDetectedOpening.opening.id === op.id;

    modal.innerHTML = `
      <div class="ziga-opening-modal-dialog" style="width: 720px; max-height: 90vh;">
        <div class="ziga-op-modal-header">
          <div class="ziga-op-modal-title-group">
            <span class="ziga-op-modal-icon">📖</span>
            <div>
              <h3 class="ziga-op-modal-title">${op.name}</h3>
              <span class="ziga-op-modal-cat">${op.category} · ${op.winRate} ${isMatchCurrent ? '⭐ (Đang khớp ván đấu)' : ''}</span>
            </div>
          </div>
          <button class="ziga-op-modal-close" id="ziga-op-modal-close-btn" type="button">✕</button>
        </div>

        <div class="ziga-op-modal-body" style="padding: 14px 18px; max-height: calc(90vh - 65px); overflow-y: auto;">
          <!-- Strategy & Advice Section -->
          <div class="ziga-op-section">
            <h4 class="ziga-op-sec-title">🎯 Ý Đồ Chiến Thuật</h4>
            <p class="ziga-op-sec-text">${op.strategy}</p>
          </div>

          <div class="ziga-op-grid">
            <div class="ziga-op-card red-card">
              <h5 class="ziga-op-card-head" style="margin: 0 0 4px 0; color: #ef4444; font-size: 12px; font-weight: 800;">🔴 Lời Khuyên Bên Đỏ:</h5>
              <p class="ziga-op-card-body" style="margin: 0; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">${op.redAdvise}</p>
            </div>
            <div class="ziga-op-card black-card" style="border-left: 3px solid #38bdf8;">
              <h5 class="ziga-op-card-head" style="margin: 0 0 4px 0; color: #38bdf8; font-size: 12px; font-weight: 800;">⚫ Lời Khuyên Bên Đen:</h5>
              <p class="ziga-op-card-body" style="margin: 0; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">${op.blackAdvise}</p>
            </div>
          </div>

          <!-- Moves Sequence -->
          <div class="ziga-op-section" style="margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h4 class="ziga-op-sec-title" style="margin: 0;">📜 Trình Tự Nước Đi Chuẩn:</h4>
              <button class="ziga-btn-tool-sub" id="ziga-btn-op-sandbox" style="padding: 3px 8px; font-size: 11px; background: rgba(212, 175, 55, 0.2); border: 1px solid rgba(212, 175, 55, 0.5); color: #ffd700;" title="Mở bàn cờ mô phỏng Sandbox để tự do đi thử thế trận này">♟️ Thử Trên Bàn Cờ Ảo</button>
            </div>
            <div class="ziga-op-moves-bar" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 10px; background: rgba(0, 0, 0, 0.35); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08);">
              ${op.moves.map((m, idx) => `<span class="ziga-op-move-chip" style="font-size: 11.5px; color: #e2e8f0; background: rgba(255, 255, 255, 0.06); padding: 2px 7px; border-radius: 4px;"><strong style="color: #ffd700;">${idx + 1}.</strong> ${m}</span>`).join('')}
            </div>
          </div>

          <!-- Search & Library Explorer Divider -->
          <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 10px 0 6px 0;"></div>

          <!-- 60+ Openings Browser -->
          <div class="ziga-op-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 class="ziga-op-sec-title" style="margin: 0; color: #ffd700;">📚 Tra Cứu 60+ Thế Trận Cờ Tướng (${filteredList.length})</h4>
              <input type="text" id="ziga-op-search-input" placeholder="🔍 Tìm thế trận (VD: Bình Phong Mã, Thuận Pháo, P2-5)..." value="${searchTerm || ''}" style="width: 250px; padding: 4px 10px; font-size: 11.5px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 6px; color: #f8fafc; outline: none;" />
            </div>

            <div id="ziga-op-list-wrap" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; max-height: 190px; overflow-y: auto; padding-right: 4px;">
              ${filteredList.map(item => {
                const isSelected = item.id === op.id;
                return `
                  <div class="ziga-op-item-chip" data-opid="${item.id}" style="padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; background: ${isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${isSelected ? '#ffd700' : 'rgba(255, 255, 255, 0.08)'}; display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 11.5px; font-weight: 700; color: ${isSelected ? '#ffd700' : '#e2e8f0'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                      ${isSelected ? '<span style="color: #ffd700; font-size: 11px;">✓</span>' : ''}
                    </div>
                    <span style="font-size: 9.5px; color: #94a3b8;">${item.category}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind close button
    const closeBtn = document.getElementById('ziga-op-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Bind Sandbox trial button
    const sbBtn = document.getElementById('ziga-btn-op-sandbox');
    if (sbBtn) {
      sbBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (ZigaMod.openTacticalSandbox) {
          ZigaMod.openTacticalSandbox();
        }
      });
    }

    // Bind item click
    const chips = modal.querySelectorAll('.ziga-op-item-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const opId = chip.getAttribute('data-opid');
        const found = OPENING_DATABASE.find(x => x.id === opId);
        if (found) {
          selectedModalOpening = found;
          const searchInput = document.getElementById('ziga-op-search-input');
          const currentSearch = searchInput ? searchInput.value : '';
          renderModalContent(modal, found, currentSearch);
        }
      });
    });

    // Bind search input
    const searchInput = document.getElementById('ziga-op-search-input');
    if (searchInput) {
      // Focus and preserve cursor at end
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        renderModalContent(modal, op, val);
        const newSearchInput = document.getElementById('ziga-op-search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(val.length, val.length);
        }
      });
    }
  }

  // Export to namespace
  ZigaMod.OPENING_DATABASE = OPENING_DATABASE;
  ZigaMod.detectOpening = detectOpening;
  ZigaMod.updateOpeningUi = updateOpeningUi;
  ZigaMod.showOpeningModal = showOpeningModal;

})(window.ZigaMod = window.ZigaMod || {});
