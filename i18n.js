/**
 * RollPack Pro - Internationalization (i18n) Engine
 * Supports Thai (ไทย - th) & Simplified Chinese (中文 - zh)
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'rollpack_lang';

    const DICTIONARY = {
        th: {
            // General / Header
            'app.title.index': 'RollPack Pro · วางแผนบรรจุม้วนกระดาษ',
            'app.title.line': 'RollPack Pro · วางแผนไลน์การผลิตม้วนกระดาษ',
            'nav.container': 'จัดเรียงตู้คอนเทนเนอร์',
            'nav.line': 'คำนวณไลน์ผลิต',
            'nav.badge.new': 'ใหม่',
            'header.units': 'หน่วย',
            'header.units.metric': 'มม. / กก.',
            'header.units.imperial': 'นิ้ว / ปอนด์',
            'header.copy': 'คัดลอกสรุป',
            'header.copy.title': 'คัดลอกสรุปผลการจัดไลน์ผลิต',
            'header.copy_spec': 'คัดลอกสเปก',
            'header.copy_spec.title': 'คัดลอกสเปกและผลลัพธ์ทั้งหมด',
            'header.print': 'พิมพ์',
            'header.print.title': 'พิมพ์ใบสั่งผลิตหรือบันทึก PDF',
            'header.help': 'วิธีใช้',
            'header.reset': 'เริ่มใหม่',
            'header.reset.title': 'ล้างข้อมูลและเริ่มใหม่',

            // Line Production Intro
            'line.intro.title': 'วางแผนไลน์การผลิตม้วนกระดาษ',
            'line.intro.desc': 'เลือกเครื่องจักร ใส่รายการออเดอร์ แล้วดูเครื่องจักรที่คุ้มค่าและผังชุดตัดได้ทันที',
            'line.intro.live': 'คำนวณอัตโนมัติเมื่อแก้ไขข้อมูล',

            // Line Production Step 1
            'line.step1.title': 'เครื่องจักรและความยาวหน้ากว้างผลิต (คลิกเพื่อเปิด/ปิดเครื่อง)',
            'line.step1.deckle_title': 'ความยาวผลิต (หน้ากว้าง)',
            'line.step1.active': 'พร้อมเดินเครื่อง',
            'line.step1.inactive': 'ปิดซ่อมบำรุง',
            'line.step1.active_summary': 'เปิดใช้งาน <strong>{count} จาก 4 เครื่อง</strong>: {details}',
            'line.step1.none_active': '<span style="color:#ef4444; font-weight:600;">ไม่มีเครื่องจักรที่เปิดใช้งาน (กรุณาเปิดอย่างน้อย 1 เครื่อง)</span>',
            'line.step1.details_toggle': 'ดู / ปรับช่วงความยาวหน้ากว้าง & สเปกเครื่องจักร',
            'line.step1.min_len': 'ความยาวต่ำสุด (มม.)',
            'line.step1.max_len': 'ความยาวสูงสุด (มม.)',
            'line.step1.hint': 'ค่าเริ่มต้นของ PM2, PM3, PM5 ตรงตามสเปกโรงงาน ส่วน PM1 กำหนดไว้ 1,600-1,800 มม. สามารถแก้ไขได้',

            // Line Production Step 2
            'line.step2.title': 'ใส่ข้อมูลออเดอร์ม้วนกระดาษ',
            'line.step2.samples': 'ลองตัวอย่าง:',
            'line.step2.sample_mix': 'ผสม KT+CA',
            'line.step2.sample_ca': 'CA ล้วน',
            'line.step2.sample_kt': 'KT หน้ากว้าง',
            'line.step2.sample_clear': 'ล้างรายการ',
            'line.step2.th_grade': 'เกรด',
            'line.step2.th_width': 'หน้ากว้าง (มม.)',
            'line.step2.th_qty': 'จำนวน (ม้วน)',
            'line.step2.th_actions': 'จัดการ',
            'line.step2.add_order': '+ เพิ่มรายการออเดอร์',
            'line.step2.sample_multi': 'หลายขนาด',
            'line.step2.order_summary': 'รวมออเดอร์ <strong>{items} รายการ</strong>: <strong>{rolls}</strong> ม้วน | กว้าง {min}–{max} มม.',
            'line.step2.add_order_btn': '＋ เพิ่มออเดอร์',
            'line.step2.strategy_title': 'เป้าหมายความคุ้มค่า (Optimization Strategy)',
            'line.step2.strat_rec': 'แนะนำโดยระบบ',
            'line.step2.strat_min_mach': 'เดินเครื่องน้อยสุด',
            'line.step2.strat_min_waste': 'เศษกระดาษต่ำสุด',
            'line.step2.help_rec': 'วิเคราะห์จุดสมดุลที่ดีที่สุดระหว่างการประหยัดค่าเดินเครื่องหลายเครื่องพร้อมกันกับมูลค่าเศษกระดาษ Trim Loss',
            'line.step2.help_min_mach': 'เน้นรวบรวมคำสั่งผลิตลงในเครื่องจักรจำนวนน้อยที่สุด เพื่อลดต้นทุนการเปิดเครื่องและการสลับหน้ากว้าง',
            'line.step2.help_min_waste': 'เน้นการจัดชุดตัดที่สร้างเศษขอบ Trim Loss ต่ำที่สุด เพื่อประหยัดเนื้อกระดาษสูงสุด',
            'line.step2.paste_summary': '📋 วางข้อมูลหลายแถวจาก Excel / Google Sheets',
            'line.step2.paste_hint': 'คัดลอกเซลล์ 3 หรือ 4 คอลัมน์: <strong>[เกรด (KT/CA)] [หน้ากว้าง (มม.)] [จำนวนม้วน] [ชื่อออเดอร์ (ไม่ระบุก็ได้)]</strong>',
            'line.step2.paste_btn': 'นำเข้าข้อมูล',
            'line.step2.import_toggle': 'นำเข้า / ส่งออกข้อมูลออเดอร์ (CSV & Text)',
            'line.step2.import_label': 'วางข้อมูล (รูปแบบ: เกรด,หน้ากว้าง,จำนวน ต่อ 1 บรรทัด เช่น KT,1050,40):',
            'line.step2.import_btn': 'นำเข้าข้อมูล',
            'line.step2.export_btn': 'คัดลอกเป็น CSV',

            // Line Production Step 3
            'line.step3.title': 'ผลการคำนวณและผังชุดตัด',
            'line.step3.copy_spec': 'คัดลอกสเปก',
            'line.step3.print': 'พิมพ์',
            'line.step3.eyebrow': 'เครื่องจักรที่แนะนำสูงสุด',
            'line.step3.single_mach': 'เดินเครื่องเดียว',
            'line.step3.multi_mach': '{count} เครื่องพร้อมกัน',
            'line.step3.badge_single': '✓ คุ้มค่าสูงสุด (เดินเครื่องเดียว)',
            'line.step3.badge_multi': '2 เครื่อง (ตามขนาดหน้ากว้าง)',
            'line.step3.detail_single': 'รวบรวมคำสั่งผลิตทั้งหมดมารันบน {name} [ช่วงความยาวหน้ากว้าง {range}] เพียงเครื่องเดียว ช่วยประหยัดต้นทุนค่าเปิดเครื่องจักรสูงสุด พร้อมรักษาเศษ Trim Loss รวมเพียง {trim}%',
            'line.step3.detail_multi': 'แบ่งการผลิตตามช่วงความยาวหน้ากว้างของ {details} ช่วยลดเศษ Trim Loss รวมเหลือเพียง {trim}%',
            'line.step3.stat_machines': 'จำนวนเครื่องเปิด',
            'line.step3.stat_trim': 'เศษ Trim Loss',
            'line.step3.stat_sets': 'แม่ม้วนที่ผลิต',
            'line.step3.stat_rolls': 'ม้วนออเดอร์รวม',
            'line.step3.stat_yield': 'สัดส่วนการใช้หน้ากระดาษแม่ม้วน (Deckle Yield)',
            'line.step3.diagram_title': 'ผังจำลองชุดตัดแม่ม้วน (Slitting Diagram)',
            'line.step3.view_single': 'ทีละชุด',
            'line.step3.view_all': 'ทุกชุดตัด',
            'line.step3.legend_rolls': 'ม้วนที่ตัดได้',
            'line.step3.legend_trim': 'เศษริม (Trim Loss)',
            'line.step3.legend_knife': 'ใบมีดกรีด',
            'line.step3.pattern_label': 'ชุดตัด',
            'line.step3.stat_deckle': 'หน้ากว้างแม่ม้วนที่ตั้ง',
            'line.step3.stat_pattern_sets': 'รอบผลิตชุดนี้',
            'line.step3.stat_pattern_rolls': 'ม้วนที่ได้จากชุดนี้',
            'line.step3.compare_title': 'เปรียบเทียบแผนการใช้เครื่องจักร',
            'line.step3.th_plan': 'แผนการผลิต',
            'line.step3.th_machines': 'เครื่องจักร',
            'line.step3.th_trim': 'เศษขอบ Trim',
            'line.step3.th_sets': 'รอบผลิต (Sets)',
            'line.step3.th_status': 'สถานะ / เลือกดู',
            'line.step3.chosen_status': 'กำลังดูผังนี้',
            'line.step3.click_to_view': 'คลิกเพื่อดู',
            'line.step3.recommended_tag': '[แนะนำ]',
            'line.step3.workorder_title': 'ตารางคำสั่งตัดและตำแหน่งใบมีด (Work Order & Knife Settings)',
            'line.step3.th_set_no': 'ชุดที่',
            'line.step3.th_machine': 'เครื่องจักร',
            'line.step3.th_grade_col': 'เกรด',
            'line.step3.th_deckle_col': 'หน้ากว้างแม่ม้วน',
            'line.step3.th_cuts_col': 'ขนาดม้วนที่ตัด (มม.)',
            'line.step3.th_knives_col': 'ตำแหน่งมีด (มม.)',
            'line.step3.th_sets_col': 'รอบผลิต (Sets)',
            'line.step3.th_trim_col': 'เศษริม (มม.)',
            'line.notes.1': 'ผลการคำนวณเป็นการจำลองการจัดชุดตัด (Cutting Stock Pattern) ตามช่วงหน้ากว้างของเครื่องจักรที่เปิดใช้งาน',
            'line.notes.2': 'ก่อนเริ่มการผลิตจริง ฝ่ายผลิตควรตรวจสอบการรับแรงดึงของใบมีดกรีด การสำรองเศษริม และคลังสต็อกแม่ม้วน',
            'line.footer.1': 'RollPack Pro · เครื่องมือวางแผนไลน์ผลิตและตัดม้วนกระดาษ',
            'line.footer.2': 'สเปกเครื่องจักรและรายการออเดอร์สามารถปรับเปลี่ยนได้ตามจริง',

            // Container Page (index.html)
            'container.intro.title': 'วางแผนบรรจุม้วนกระดาษ',
            'container.intro.desc': 'เลือกตู้ ใส่ขนาดม้วน แล้วดูจำนวนและผังการจัดวางได้ทันที',
            'container.intro.live': 'คำนวณอัตโนมัติเมื่อแก้ไขข้อมูล',
            'container.step1.title': 'เลือกตู้คอนเทนเนอร์',
            'container.step1.details': 'ดู / แก้ไขขนาดภายในตู้',
            'container.step2.title': 'กำหนดขนาดและน้ำหนักม้วนกระดาษ',
            'container.step2.samples': 'ลองตัวอย่างสเปกยอดนิยม:',
            'container.step2.orient_label': 'ทิศทางการวาง',
            'container.step2.orient_auto': 'อัตโนมัติ (แนะนำ)',
            'container.step2.orient_vert': 'แนวตั้งทั้งหมด',
            'container.step2.orient_horiz': 'แนวนอนทั้งหมด',
            'container.step3.title': 'สรุปผลและผังการจัดเรียง',
            'container.step3.max_rolls': 'บรรจุได้สูงสุด',
            'container.step3.rolls_unit': 'ม้วน',
            'container.step3.total_weight': 'น้ำหนักกระดาษรวม',
            'container.step3.remaining_weight': 'น้ำหนักบรรทุกคงเหลือ',
            'container.step3.payload_pct': 'สัดส่วนน้ำหนักบรรทุก',
            'container.step3.per_layer': 'บรรจุต่อชั้น',
            'container.step3.used_layers': 'จำนวนชั้นที่จัดวาง',
            'container.step3.physical_count': 'วางจริงตามพื้นที่',
            'container.step3.physical_hint': '*ความจุของรูปแบบที่เลือกก่อนจำกัดน้ำหนัก ไม่ใช่จำนวนที่ควรบรรจุ',
            'container.step3.view_top': 'ด้านบน (Top View)',
            'container.step3.view_side': 'ด้านข้าง (Side View)',
            'container.step3.layer_label': 'ชั้นที่',
            'container.step3.compare_title': 'เปรียบเทียบรูปแบบการจัดวาง',
            'container.step3.compare_hint': 'เมื่อจำนวนเท่ากัน เลือกแบบที่ใช้ชั้นน้อยกว่า เปรียบเทียบเฉพาะรูปแบบที่คำนวณได้',
            'container.step3.th_pattern': 'รูปแบบการวาง',
            'container.step3.th_geom': 'ตามพื้นที่ตู้',
            'container.step3.th_payload_cap': 'ตามพิกัดน้ำหนัก',
            'container.footer.1': 'RollPack Pro · เครื่องมือวางแผนเบื้องต้น',
            'container.footer.2': 'ขนาดภายในตู้และพิกัดสามารถแก้ไขได้',
            'container.help.dialog_title': 'คำนวณได้ใน 3 ขั้นตอน',
            'container.help.step1': '1. เลือกตู้: ใช้ขนาดตัวอย่าง หรือเปิด “ดู / แก้ไขขนาดภายในตู้” เพื่อใส่ข้อมูลตู้จริง',
            'container.help.step2': '2. ใส่ข้อมูลม้วน: ระบุเส้นผ่านศูนย์กลาง หน้ากว้าง และน้ำหนักต่อม้วน ให้ตรงกับหน่วยที่เลือก',
            'container.help.step3': '3. ดูผลและผัง: จำนวนหลักถูกจำกัดด้วยพิกัดน้ำหนักที่กรอก เลือก “ด้านบน” แล้วกดลูกศรข้าง “ชั้น” เพื่อดูแต่ละชั้น หรือเลือก “ด้านข้าง” เพื่อดูความสูงรวมและระดับช่องประตู',
            'container.help.pwa': 'ใช้บนมือถือได้โดยเปิดลิงก์นี้ในเบราว์เซอร์ และเพิ่มไปยังหน้าจอหลักจากเมนูของเบราว์เซอร์ได้หากรองรับ',
            'container.help.close': 'เข้าใจแล้ว',
            'container.reset.dialog_title': 'เริ่มคำนวณใหม่?',
            'container.reset.desc': 'กลับไปใช้ตู้ 20 ฟุต ม้วนมาตรฐาน และหน่วยมิลลิเมตร / กิโลกรัม ข้อมูลที่กำลังกรอกจะถูกแทนที่',
            'container.reset.cancel': 'กรอกต่อ',
            'container.reset.confirm': 'เริ่มใหม่',
            'container.preset.gp': 'ตู้แห้งทั่วไป',
            'container.preset.hc': 'ตู้ทรงสูง',
            'container.preset.custom': '＋ กำหนดขนาดเอง',
            'container.step1.hint': 'ค่าเริ่มต้นเป็นตัวอย่างจากไฟล์เดิม ตรวจสอบขนาดและพิกัดของตู้จริงก่อนใช้งาน',
            'container.sample.standard': 'มาตรฐาน',
            'container.sample.jumbo': 'จัมโบ้',
            'container.step2.roll_height_hint': 'หน้ากว้างม้วน = ความสูงเมื่อวางม้วนตั้งขึ้น',
            'container.step2.orient_auto_short': 'อัตโนมัติ',
            'container.step2.orient_vert_short': 'แนวตั้ง',
            'container.step2.orient_horiz_short': 'แนวนอน',
            'container.step2.clearance_title': 'ระยะเผื่อระหว่างม้วน',
            'container.step2.clearance_hint': 'เว้นระยะบนพื้นระหว่างม้วน รวมระยะครึ่งหนึ่งที่ผนังแต่ละด้าน ไม่รวมระยะเผื่อแนวตั้งหรืออุปกรณ์ยก',
            'container.step3.plan_title': 'ผังการจัดวาง',
            'container.step3.view_top_btn': 'ด้านบน',
            'container.step3.view_side_btn': 'ด้านข้าง',
            'container.step3.legend_loaded': 'ม้วนที่บรรจุ',
            'container.step3.legend_empty': 'ตำแหน่งว่าง',
            'container.step3.legend_door': 'ประตู',
            'container.notes.1': 'ผลเป็นการประมาณจากขนาดและน้ำหนักม้วนชนิดเดียว ไม่รวมวัสดุรองและรัดตรึง และไม่ใช่การรับรองความปลอดภัยหรือข้อกฎหมาย',
            'container.notes.2': 'ก่อนโหลดจริง ให้ผู้รับผิดชอบตรวจสอบการกระจายน้ำหนัก การรับแรงซ้อน ช่องประตู และวิธีการยก โดยเฉพาะการวางนอนและการวางซ้อน',
            'container.mobile.jump': 'ดูผังและผลลัพธ์ ↓',
            'skip.calculator': 'ข้ามไปเครื่องคำนวณ',

            // Common terms & toasts
            'common.mm': 'มม.',
            'common.unit_machine': 'เครื่อง',
            'common.unit_roll': 'ม้วน',
            'common.unit_set': 'เซ็ต',
            'toast.reset_success': 'รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว',
            'confirm.reset': 'ต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นหรือไม่?',
            'toast.copied': 'คัดลอกรายละเอียดแผนลงคลิปบอร์ดแล้ว',
            'toast.import_success': 'นำเข้าสำเร็จ {count} รายการ',
            'toast.machine_status': '{name} {status}'
        },
        zh: {
            // General / Header
            'app.title.index': 'RollPack Pro · 集装箱纸卷装箱规划系统',
            'app.title.line': 'RollPack Pro · 原纸分切与生产线排产优化',
            'nav.container': '集装箱装箱规划',
            'nav.line': '原纸生产线排产',
            'nav.badge.new': '新功能',
            'header.units': '单位',
            'header.units.metric': '毫米 / 公斤 (mm / kg)',
            'header.units.imperial': '英寸 / 磅 (inch / lb)',
            'header.copy': '复制总结',
            'header.copy.title': '复制排产方案总结',
            'header.copy_spec': '复制规格',
            'header.copy_spec.title': '复制所有规格与计算结果',
            'header.print': '打印 / PDF',
            'header.print.title': '打印生产工单或保存PDF',
            'header.help': '使用指南',
            'header.reset': '重新开始',
            'header.reset.title': '清空并恢复默认设置',

            // Line Production Intro
            'line.intro.title': '原纸分切与生产线排产规划',
            'line.intro.desc': '选择可用开机机台，录入纸卷订单需求，即时计算最优排产机台与分切方案',
            'line.intro.live': '数据更改实时自动计算',

            // Line Production Step 1
            'line.step1.title': '机台选择与可用门幅宽度（点击切换开/停机）',
            'line.step1.deckle_title': '可用门幅 (幅宽)',
            'line.step1.active': '正常开机',
            'line.step1.inactive': '停机检修',
            'line.step1.active_summary': '已开启 <strong>{count} / 4 台机</strong>：{details}',
            'line.step1.none_active': '<span style="color:#ef4444; font-weight:600;">当前未开启任何机台（请至少开启 1 台）</span>',
            'line.step1.details_toggle': '查看 / 自定义机台门幅与参数',
            'line.step1.min_len': '最小门幅 (mm)',
            'line.step1.max_len': '最大门幅 (mm)',
            'line.step1.hint': '默认参数：PM2、PM3、PM5 符合原厂标准，PM1 默认设定为 1600-1800mm，可按需修改',

            // Line Production Step 2
            'line.step2.title': '录入纸卷订单需求',
            'line.step2.samples': '示例数据：',
            'line.step2.sample_mix': '混合 KT+CA',
            'line.step2.sample_ca': '纯 CA 订单',
            'line.step2.sample_kt': 'KT 宽幅大单',
            'line.step2.sample_clear': '清空订单',
            'line.step2.th_grade': '纸种',
            'line.step2.th_width': '幅宽 (mm)',
            'line.step2.th_qty': '数量 (卷)',
            'line.step2.th_actions': '操作',
            'line.step2.add_order': '+ 添加订单项',
            'line.step2.sample_multi': '多种规格',
            'line.step2.order_summary': '订单总计 <strong>{items} 项</strong>：<strong>{rolls}</strong> 卷 | 幅宽 {min}–{max} mm',
            'line.step2.add_order_btn': '＋ 添加订单项',
            'line.step2.strategy_title': '优化策略目标 (Optimization Strategy)',
            'line.step2.strat_rec': '系统智能推荐',
            'line.step2.strat_min_mach': '最少开机台数',
            'line.step2.strat_min_waste': '最小边料损耗',
            'line.step2.help_rec': '智能权衡多机开机固定成本与边角料废丝价值，寻找综合效益最高方案',
            'line.step2.help_min_mach': '优先将订单集中到最少机台上生产，最大化降低换规格与调机成本',
            'line.step2.help_min_waste': '优先寻找边料损耗（Trim Loss）最低的排刀组合，最大化原纸幅宽利用率',
            'line.step2.paste_summary': '📋 从 Excel / 电子表格批量粘贴订单',
            'line.step2.paste_hint': '复制 3 或 4 列单元格：<strong>[纸种(KT/CA)] [幅宽(mm)] [数量] [订单号(选填)]</strong>',
            'line.step2.paste_btn': '导入数据',
            'line.step2.import_toggle': '导入 / 导出订单数据 (CSV & 文本)',
            'line.step2.import_label': '粘贴数据（格式：纸种,幅宽,数量 每行一条，例如 KT,1050,40）：',
            'line.step2.import_btn': '导入数据',
            'line.step2.export_btn': '导出为 CSV',

            // Line Production Step 3
            'line.step3.title': '排产计算结果与分切方案',
            'line.step3.copy_spec': '复制明细',
            'line.step3.print': '打印报告',
            'line.step3.eyebrow': '最优推荐机台',
            'line.step3.single_mach': '单机排产',
            'line.step3.multi_mach': '{count} 台机协同',
            'line.step3.badge_single': '✓ 综合效益最优 (单机排产)',
            'line.step3.badge_multi': '2 台机协同 (按门幅分工)',
            'line.step3.detail_single': '汇总所有生产订单由 {name} [门幅区间 {range}] 单机完成排产，最大化降低多机开机固定成本，且总边料损耗仅为 {trim}%',
            'line.step3.detail_multi': '按门幅适配性在 {details} 进行协同分工生产，将总边料损耗降至 {trim}%',
            'line.step3.stat_machines': '开机数量',
            'line.step3.stat_trim': '边料损耗 (Trim)',
            'line.step3.stat_sets': '母卷制造轮次',
            'line.step3.stat_rolls': '产出成品纸卷',
            'line.step3.stat_yield': '母卷幅宽利用率 (Deckle Yield)',
            'line.step3.diagram_title': '母卷分切刀位排布图 (Slitting Diagram)',
            'line.step3.view_single': '单组查看',
            'line.step3.view_all': '全部平铺',
            'line.step3.legend_rolls': '成品纸卷',
            'line.step3.legend_trim': '边料废丝 (Trim)',
            'line.step3.legend_knife': '分切刀位',
            'line.step3.pattern_label': '分切组',
            'line.step3.stat_deckle': '设定母卷门幅',
            'line.step3.stat_pattern_sets': '本组生产轮次',
            'line.step3.stat_pattern_rolls': '本组产出卷数',
            'line.step3.compare_title': '各机台排产方案综合对比',
            'line.step3.th_plan': '生产方案',
            'line.step3.th_machines': '机台组合',
            'line.step3.th_trim': '边料损耗',
            'line.step3.th_sets': '母卷轮次 (Sets)',
            'line.step3.th_status': '状态 / 切换',
            'line.step3.chosen_status': '当前展示',
            'line.step3.click_to_view': '点击查看',
            'line.step3.recommended_tag': '[推荐]',
            'line.step3.workorder_title': '分切工单与排刀参数表 (Work Order & Knife Settings)',
            'line.step3.th_set_no': '组号',
            'line.step3.th_machine': '机台',
            'line.step3.th_grade_col': '纸种',
            'line.step3.th_deckle_col': '母卷门幅',
            'line.step3.th_cuts_col': '分切规格 (mm)',
            'line.step3.th_knives_col': '排刀刻度 (mm)',
            'line.step3.th_sets_col': '轮次 (Sets)',
            'line.step3.th_trim_col': '边料 (mm)',
            'line.notes.1': '计算结果基于选定机台门幅区间，通过裁切库存优化算法（Cutting Stock Problem）自动求解最优组合。',
            'line.notes.2': '实际开机前，请车间复核分切机刀压强度、边料修边余量及造纸母卷实际库存。',
            'line.footer.1': 'RollPack Pro · 原纸分切与生产线排产优化系统',
            'line.footer.2': '造纸机台参数与客户订单规格均可根据车间实际生产要求实时调整',

            // Container Page (index.html)
            'container.intro.title': '集装箱纸卷装箱规划',
            'container.intro.desc': '选择集装箱，输入纸卷规格与重量，即时生成最大装箱量与空间排布图',
            'container.intro.live': '数据更改实时自动计算',
            'container.step1.title': '第一步：选择集装箱',
            'container.step1.details': '查看 / 自定义箱内尺寸',
            'container.step2.title': '第二步：纸卷规格与重量',
            'container.step2.samples': '常用规格示例：',
            'container.step2.orient_label': '摆放方向',
            'container.step2.orient_auto': '自动推荐（按载重最优）',
            'container.step2.orient_vert': '立式摆放',
            'container.step2.orient_horiz': '卧式摆放',
            'container.step3.title': '第三步：装箱方案与排布图',
            'container.step3.max_rolls': '最大装载量',
            'container.step3.rolls_unit': '卷',
            'container.step3.total_weight': '纸卷总重',
            'container.step3.remaining_weight': '剩余可用载重',
            'container.step3.payload_pct': '载重利用率',
            'container.step3.per_layer': '单层装载量',
            'container.step3.used_layers': '实际摆放层数',
            'container.step3.physical_count': '理论空间容纳量',
            'container.step3.physical_hint': '*所选排布方案在载重限制前的理论容积容量，并非最终建议装箱数',
            'container.step3.view_top': '俯视图 (Top View)',
            'container.step3.view_side': '侧视图 (Side View)',
            'container.step3.layer_label': '层数',
            'container.step3.compare_title': '排布方案综合对比',
            'container.step3.compare_hint': '数量相同时优先推荐堆码层数较少的方案；仅比对可行的排版模式',
            'container.step3.th_pattern': '排列方式',
            'container.step3.th_geom': '空间容纳',
            'container.step3.th_payload_cap': '载重限制装载',
            'container.footer.1': 'RollPack Pro · 纸卷物流装箱预估工具',
            'container.footer.2': '集装箱内部尺寸及核定载重均支持自定义调整',
            'container.help.dialog_title': '三步快速完成装箱规划',
            'container.help.step1': '1. 选择集装箱：直接选用标准箱型，或展开“查看 / 自定义箱内尺寸”填写真实尺寸。',
            'container.help.step2': '2. 填写纸卷参数：输入外径、幅宽及单卷重量，请确认与当前选择的单位一致。',
            'container.help.step3': '3. 查看方案与排图：装载量受集装箱限重智能约束。可切换“俯视图”逐层查看点位，或切换“侧视图”核对总高度与箱门间距。',
            'container.help.pwa': '支持移动端浏览，在手机浏览器中打开可直接保存至主屏幕当做App使用。',
            'container.help.close': '我知道了',
            'container.reset.dialog_title': '确定重新开始？',
            'container.reset.desc': '将恢复默认 20尺普柜、标准纸卷规格与公制单位，当前填写的自定义数据将被重置。',
            'container.reset.cancel': '继续编辑',
            'container.reset.confirm': '重新开始',
            'container.preset.gp': '标准普柜',
            'container.preset.hc': '高柜 (HQ)',
            'container.preset.custom': '＋ 自定义尺寸',
            'container.step1.hint': '初始数据为标准参考值，请在实际排装前核对集装箱内壁真实尺寸与限重',
            'container.sample.standard': '标准卷',
            'container.sample.jumbo': '大卷 (Jumbo)',
            'container.step2.roll_height_hint': '纸卷幅宽 = 立放时的圆柱高度',
            'container.step2.orient_auto_short': '智能推荐',
            'container.step2.orient_vert_short': '立放',
            'container.step2.orient_horiz_short': '卧放',
            'container.step2.clearance_title': '纸卷间隙余量 (Clearance)',
            'container.step2.clearance_hint': '纸卷间地面预留间隙（包含两侧箱壁各一半预留），不含垂直顶部间隙或索具吊装裕量',
            'container.step3.plan_title': '空间排布图',
            'container.step3.view_top_btn': '俯视图',
            'container.step3.view_side_btn': '侧视图',
            'container.step3.legend_loaded': '装载纸卷',
            'container.step3.legend_empty': '未满空位',
            'container.step3.legend_door': '箱门',
            'container.notes.1': '装载计算基于单一规格纸卷的几何与重量约束，未包含木托盘、充气袋及捆扎带占用空间，不作为法定配载安全证明。',
            'container.notes.2': '实际装箱前，现场调度与理货员必须复核轴荷分布、抗压强度、箱门通行高度及叉车吊装方案（特别是卧放滚装与多层堆叠）。',
            'container.mobile.jump': '查看排布图与方案 ↓',
            'skip.calculator': '跳至计算器',

            // Common terms & toasts
            'common.mm': 'mm',
            'common.unit_machine': '台',
            'common.unit_roll': '卷',
            'common.unit_set': '组',
            'toast.reset_success': '已恢复初始默认数据',
            'confirm.reset': '确定要将所有数据重置为默认值吗？',
            'toast.copied': '生产方案明细已复制到剪贴板',
            'toast.import_success': '成功导入 {count} 条订单数据',
            'toast.machine_status': '{name} 已切换为 {status}'
        }
    };

    let currentLang = 'th';
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'zh' || saved === 'th') {
            currentLang = saved;
        }
    } catch (e) {
        // LocalStorage fallback
    }

    function t(key, params, fallback) {
        let text = (DICTIONARY[currentLang] && DICTIONARY[currentLang][key]) ||
                   (DICTIONARY['th'] && DICTIONARY['th'][key]) ||
                   fallback || key;

        if (params && typeof params === 'object') {
            Object.keys(params).forEach(p => {
                text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
            });
        }
        return text;
    }

    function applyTranslations() {
        if (document.documentElement) {
            document.documentElement.lang = currentLang;
        }

        // Update page title if key present
        if (document.body && document.body.dataset && document.body.dataset.pageTitleKey) {
            document.title = t(document.body.dataset.pageTitleKey);
        }

        // Elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const attr = el.dataset.i18nAttr;
            const translated = t(key);
            if (attr) {
                el.setAttribute(attr, translated);
            } else {
                el.innerHTML = translated;
            }
        });

        // Elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.setAttribute('title', t(el.dataset.i18nTitle));
        });

        // Elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
        });

        // Update active class on language buttons
        document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
            const isMatch = btn.dataset.lang === currentLang;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-pressed', String(isMatch));
        });

        // Dispatch language change event for other JS modules to re-render
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            try {
                const evt = typeof CustomEvent === 'function' 
                    ? new CustomEvent('languageChanged', { detail: { lang: currentLang } })
                    : { type: 'languageChanged', detail: { lang: currentLang } };
                window.dispatchEvent(evt);
            } catch (e) {}
        }
    }

    function setLanguage(lang) {
        if (lang !== 'th' && lang !== 'zh') return;
        currentLang = lang;
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
        applyTranslations();
    }

    function init() {
        // Bind switcher buttons
        document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                setLanguage(btn.dataset.lang);
            });
        });

        applyTranslations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    global.RollPackI18n = {
        t,
        getLanguage: () => currentLang,
        setLanguage,
        applyTranslations,
        translations: DICTIONARY
    };
    global.t = t;

})(typeof window !== 'undefined' ? window : this);
