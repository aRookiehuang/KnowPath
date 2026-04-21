import fs from 'node:fs/promises';
import path from 'node:path';
const { Presentation, PresentationFile } = await import('file:///C:/Users/29301/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs');

const W = 1280;
const H = 720;
const OUT_DIR = path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/outputs/knowpath-defense-ppt');
const SCRATCH_DIR = path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/tmp/slides/knowpath-defense-ppt');
const PREVIEW_DIR = path.join(SCRATCH_DIR, 'preview');
const VERIFICATION_DIR = path.join(SCRATCH_DIR, 'verification');
const INSPECT_PATH = path.join(SCRATCH_DIR, 'inspect.ndjson');
const DECK_ID = 'knowpath-defense-ppt';
const MAX_RENDER_VERIFY_LOOPS = 3;

const IMG = {
  home: path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/images/首页.png'),
  path: path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/images/路径页.png'),
  teach: path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/images/教学页.png'),
  state: path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/images/状态页.png'),
  eval: path.resolve('D:/大三下/比赛-计算机设计大赛/代码/wenflow/docs/images/评价页.png'),
};

const C = {
  bg: '#F6F8FC',
  panel: '#FFFFFF',
  panel2: '#EEF2FF',
  line: '#DCE3F0',
  title: '#1F2D3D',
  body: '#445368',
  muted: '#728197',
  blue: '#4F6BFF',
  purple: '#7A5CFF',
  teal: '#00C2A8',
  green: '#22B573',
  orange: '#FF9F43',
  red: '#FF6B6B',
  softBlue: '#EAF0FF',
  softPurple: '#F1ECFF',
  softTeal: '#E8FBF7',
  deep: '#131A2A',
};

const FONT = {
  title: 'Microsoft YaHei UI',
  body: 'Microsoft YaHei',
  en: 'Poppins',
};

const inspectRecords = [];

const slideTitles = [
  '封面', '项目背景与问题提出', '项目定位', '赛道契合度说明', '核心理念', '应用场景与用户价值',
  '整体解决方案', '核心业务闭环', '用户端核心功能展示', '管理端与平台观测', '项目创新点',
  '技术架构设计', '关键实现与工程落地', '项目完成度与验证情况', '项目优势对比与应用前景', '总结'
];

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(SCRATCH_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
}

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function line(fill = C.line, width = 1) {
  return { style: 'solid', fill, width };
}

function addShape(slide, geometry, x, y, w, h, fill, stroke = null, width = 0, meta = {}) {
  const shape = slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: stroke ? line(stroke, width) : line('#00000000', 0),
  });
  if (meta.slideNo) {
    inspectRecords.push({ kind: 'shape', slide: meta.slideNo, role: meta.role || geometry, bbox: [x, y, w, h] });
  }
  return shape;
}

function addText(slide, slideNo, text, x, y, w, h, opts = {}) {
  const box = addShape(slide, 'rect', x, y, w, h, '#00000000', '#00000000', 0, { slideNo, role: opts.role || 'text' });
  box.text = text;
  box.text.fontSize = opts.size ?? 24;
  box.text.color = opts.color ?? C.title;
  box.text.bold = Boolean(opts.bold);
  box.text.typeface = opts.face ?? FONT.body;
  box.text.alignment = opts.align ?? 'left';
  box.text.verticalAlignment = opts.valign ?? 'top';
  box.text.insets = { left: opts.padX ?? 0, right: opts.padX ?? 0, top: opts.padY ?? 0, bottom: opts.padY ?? 0 };
  box.text.autoFit = opts.autoFit ?? 'shrinkText';
  inspectRecords.push({ kind: 'textbox', slide: slideNo, role: opts.role || 'text', text: String(text), textChars: String(text).length, textLines: String(text).split(/\n/).length, bbox: [x, y, w, h] });
  return box;
}

async function addImage(slide, slideNo, imagePath, x, y, w, h, fit = 'contain', radius = true, role = 'image') {
  const frame = addShape(slide, 'roundRect', x, y, w, h, C.panel, C.line, 1, { slideNo, role: `${role}-frame` });
  frame.adjustmentList = [{ name: 'adj', formula: 'val 12000' }];
  const image = slide.images.add({ blob: await readImageBlob(imagePath), fit, alt: role });
  image.position = { left: x + 10, top: y + 10, width: w - 20, height: h - 20 };
  if (radius) image.geometry = 'roundRect';
  inspectRecords.push({ kind: 'image', slide: slideNo, role, path: imagePath, bbox: [x, y, w, h] });
  return image;
}

function addBg(slide, slideNo, accent = C.blue) {
  slide.background.fill = C.bg;
  addShape(slide, 'ellipse', W - 320, -90, 430, 300, `${accent}20`, null, 0, { slideNo, role: 'bg-blob-1' });
  addShape(slide, 'ellipse', W - 180, 20, 250, 250, `${C.purple}18`, null, 0, { slideNo, role: 'bg-blob-2' });
  addShape(slide, 'ellipse', -120, H - 180, 300, 240, `${C.teal}14`, null, 0, { slideNo, role: 'bg-blob-3' });
  addShape(slide, 'roundRect', 28, 24, 1224, 46, '#FFFFFFCC', '#FFFFFF00', 0, { slideNo, role: 'topbar' });
  addText(slide, slideNo, '大学生计算机设计大赛 · 人工智能应用——实践赛道', 48, 37, 420, 18, {
    size: 14, color: C.muted, face: FONT.body, role: 'topbar-text'
  });
  addText(slide, slideNo, '知途 KnowPath', 1088, 34, 130, 22, {
    size: 16, color: accent, bold: true, face: FONT.en, align: 'right', role: 'brand'
  });
}

function addHeader(slide, slideNo, title, subtitle = '') {
  addText(slide, slideNo, `${String(slideNo).padStart(2, '0')}  ${title}`, 56, 88, 700, 44, {
    size: 28, color: C.title, bold: true, face: FONT.title, role: 'title'
  });
  if (subtitle) {
    addText(slide, slideNo, subtitle, 58, 132, 860, 32, {
      size: 14, color: C.muted, face: FONT.body, role: 'subtitle'
    });
  }
  addShape(slide, 'roundRect', 56, 160, 108, 6, C.blue, null, 0, { slideNo, role: 'title-line' });
}

function addFooter(slide, slideNo) {
  addText(slide, slideNo, `${slideNo} / 16`, 1160, 684, 70, 20, {
    size: 12, color: C.muted, face: FONT.en, align: 'right', role: 'footer-page'
  });
}

function addCard(slide, slideNo, x, y, w, h, title, body, color = C.blue, tag = null) {
  const card = addShape(slide, 'roundRect', x, y, w, h, C.panel, C.line, 1, { slideNo, role: 'card' });
  card.adjustmentList = [{ name: 'adj', formula: 'val 12000' }];
  addShape(slide, 'roundRect', x + 18, y + 18, 52, 8, color, null, 0, { slideNo, role: 'card-mark' });
  addText(slide, slideNo, title, x + 18, y + 34, w - 36, 28, {
    size: 20, color: C.title, bold: true, face: FONT.title, role: 'card-title'
  });
  addText(slide, slideNo, body, x + 18, y + 72, w - 36, h - 94, {
    size: 14, color: C.body, face: FONT.body, role: 'card-body'
  });
  if (tag) {
    addShape(slide, 'roundRect', x + w - 112, y + 18, 92, 26, `${color}18`, null, 0, { slideNo, role: 'card-tag-bg' });
    addText(slide, slideNo, tag, x + w - 106, y + 23, 80, 16, {
      size: 11, color: color, bold: true, face: FONT.body, align: 'center', role: 'card-tag'
    });
  }
}

function addBulletList(slide, slideNo, x, y, w, items, accent = C.blue, size = 16, gap = 48) {
  items.forEach((item, idx) => {
    const top = y + idx * gap;
    addShape(slide, 'ellipse', x, top + 6, 14, 14, accent, null, 0, { slideNo, role: 'bullet' });
    addText(slide, slideNo, item, x + 24, top, w - 24, 34, {
      size, color: C.body, face: FONT.body, role: 'bullet-text'
    });
  });
}

function addStep(slide, slideNo, x, y, w, h, title, desc, idx, color) {
  addShape(slide, 'roundRect', x, y, w, h, C.panel, C.line, 1, { slideNo, role: 'step-card' });
  addShape(slide, 'ellipse', x + 18, y + 18, 42, 42, color, null, 0, { slideNo, role: 'step-index-bg' });
  addText(slide, slideNo, String(idx), x + 18, y + 23, 42, 20, { size: 18, color: '#FFFFFF', bold: true, face: FONT.en, align: 'center', role: 'step-index' });
  addText(slide, slideNo, title, x + 74, y + 18, w - 92, 28, { size: 18, color: C.title, bold: true, face: FONT.title, role: 'step-title' });
  addText(slide, slideNo, desc, x + 74, y + 52, w - 92, h - 68, { size: 13, color: C.body, face: FONT.body, role: 'step-desc' });
}

function addArrow(slide, slideNo, x, y, w = 42, h = 20, color = C.blue) {
  addShape(slide, 'rightArrow', x, y, w, h, color, null, 0, { slideNo, role: 'arrow' });
}

function note(slide, text) {
  slide.speakerNotes.setText(text);
}

async function slide1(p) {
  const s = p.slides.add(); const n = 1; addBg(s, n, C.blue);
  addShape(s, 'roundRect', 56, 118, 170, 32, `${C.blue}18`, null, 0, { slideNo: n, role: 'cover-tag' });
  addText(s, n, 'AI 学习工作台 · 项目答辩', 70, 126, 140, 16, { size: 13, color: C.blue, bold: true, face: FONT.body, align: 'center', role: 'cover-tag-text' });
  addText(s, n, '知途（KnowPath）', 58, 178, 520, 64, { size: 34, color: C.title, bold: true, face: FONT.title, role: 'cover-cn' });
  addText(s, n, '面向复杂任务学习场景的 AI 学习工作台', 58, 246, 650, 60, { size: 28, color: C.blue, bold: true, face: FONT.title, role: 'cover-title' });
  addText(s, n, '聚焦“目标澄清 → 路径规划 → 学习推进 → 状态反馈”，帮助学习者把模糊目标转化为可执行路径。', 60, 322, 590, 70, { size: 17, color: C.body, face: FONT.body, role: 'cover-sub' });
  addCard(s, n, 58, 420, 202, 120, '赛道定位', '大学生计算机设计大赛\n人工智能应用——实践赛道', C.blue);
  addCard(s, n, 278, 420, 202, 120, '项目价值', '让 AI 不只回答问题，\n更持续组织学习过程', C.purple);
  addCard(s, n, 498, 420, 202, 120, '在线演示', '部署地址：47.122.53.1\n支持主链路访问与展示', C.teal);
  await addImage(s, n, IMG.home, 760, 132, 454, 434, 'contain', true, 'cover-ui');
  addText(s, n, '团队：XXX    成员：XXX    指导教师：XXX', 60, 618, 420, 24, { size: 14, color: C.muted, face: FONT.body, role: 'cover-meta' });
  addFooter(s, n);
  note(s, '开场先定性：知途不是普通聊天工具，而是一个围绕复杂任务学习场景设计的 AI 学习工作台。');
}

async function slide2(p) {
  const s = p.slides.add(); const n = 2; addBg(s, n, C.purple); addHeader(s, n, slideTitles[n-1], '复杂任务学习中，大学生真正缺的不是信息，而是可持续推进的路径。');
  addCard(s, n, 56, 208, 278, 180, '痛点一：不知道从哪开始', '用户往往知道“要完成一个项目”，却无法把目标拆解成阶段任务。', C.blue, '目标模糊');
  addCard(s, n, 354, 208, 278, 180, '痛点二：资料很多但路径缺失', '搜索、看教程、问 AI 都能得到信息，但难以沉淀为连续可执行的学习路线。', C.purple, '路径缺失');
  addCard(s, n, 652, 208, 278, 180, '痛点三：通用 AI 难以持续陪练', '传统一问一答式 AI 擅长给出回答，却不擅长持续追问、纠偏和推进。', C.teal, '过程断裂');
  addCard(s, n, 950, 208, 278, 180, '痛点四：缺少过程反馈', '学习者很难判断当前状态、节奏、认知压力与下一步动作。', C.orange, '反馈不足');
  addShape(s, 'roundRect', 56, 432, 1172, 188, '#FFFFFF', C.line, 1, { slideNo: n, role: 'summary-panel' });
  addText(s, n, '问题本质：现有工具更像“信息供给器”，而不是“学习推进器”', 84, 456, 560, 30, { size: 22, color: C.title, bold: true, face: FONT.title, role: 'summary-title' });
  addBulletList(s, n, 84, 504, 540, [
    '复杂任务学习需要先澄清目标，再规划路径。',
    '需要围绕任务过程进行多轮互动，而不是一次性输出。',
    '需要对学习状态进行观察与反馈，形成完整闭环。'
  ], C.red, 17, 42);
  await addImage(s, n, IMG.home, 782, 452, 404, 142, 'contain', true, 'pain-home');
  addFooter(s, n);
  note(s, '从真实学习痛点切入，为后续方案设计做铺垫。');
}

async function slide3(p) {
  const s = p.slides.add(); const n = 3; addBg(s, n, C.blue); addHeader(s, n, slideTitles[n-1], '从聊天工具升级为面向复杂任务学习场景的 AI 学习工作台。');
  addShape(s, 'roundRect', 56, 204, 520, 340, `${C.blue}10`, null, 0, { slideNo: n, role: 'left-zone' });
  addText(s, n, '知途是什么？', 84, 232, 240, 32, { size: 24, color: C.title, bold: true, face: FONT.title, role: 'what-title' });
  addBulletList(s, n, 84, 282, 430, [
    'AI 学习平台 / 比赛作品 / 可扩展产品原型',
    '面向大学生、竞赛参与者、项目制学习者、自主学习者',
    '核心目标：从模糊目标出发，形成清晰路径并持续推进',
    '强调“工作流设计”而不是“单次对话输出”'
  ], C.blue, 17, 52);
  addCard(s, n, 622, 214, 278, 150, '普通聊天式 AI', '更偏向回答单个问题\n缺少连续任务组织\n难以沉淀学习路径', C.orange);
  addCard(s, n, 922, 214, 278, 150, '知途 KnowPath', '围绕任务推进设计\n支持路径规划、对话学习、状态反馈\n形成完整学习闭环', C.teal);
  addShape(s, 'roundRect', 622, 392, 578, 152, '#FFFFFF', C.line, 1, { slideNo: n, role: 'positioning-box' });
  addText(s, n, '项目定位语', 648, 416, 120, 20, { size: 14, color: C.blue, bold: true, face: FONT.body, role: 'positioning-label' });
  addText(s, n, '从模糊目标出发，帮助用户形成清晰路径，并在学习执行过程中持续获得 AI 陪练与状态反馈。', 648, 446, 520, 64, { size: 20, color: C.title, bold: true, face: FONT.title, role: 'positioning-text' });
  addFooter(s, n);
  note(s, '这一页重点是将项目从普通聊天产品中区分出来。');
}

async function slide4(p) {
  const s = p.slides.add(); const n = 4; addBg(s, n, C.teal); addHeader(s, n, slideTitles[n-1], '知途具备真实问题导向、AI 驱动、完整落地与明确实践价值。');
  const items = [
    ['真实问题导向', '聚焦竞赛、课程项目、自主学习中“有目标却不会推进”的真实痛点。', C.blue],
    ['人工智能驱动', '目标澄清、路径生成、对话陪练、状态反馈等关键能力均由 AI 深度参与。', C.purple],
    ['应用落地完整', '前后端、业务流程、管理后台、部署链路均已形成可运行原型。', C.teal],
    ['实践价值明确', '既服务个人学习，也可延展到教学辅助、训练营、项目制课程等场景。', C.orange],
  ];
  items.forEach((it, i) => addCard(s, n, 86 + (i%2)*560, 214 + Math.floor(i/2)*188, 548, 160, it[0], it[1], it[2], '赛道契合'));
  addShape(s, 'roundRect', 96, 590, 1088, 60, `${C.teal}12`, null, 0, { slideNo: n, role: 'fit-summary-bg' });
  addText(s, n, '因此，知途不是概念型展示，而是面向教育场景的“人工智能应用实践型作品”。', 126, 607, 1020, 24, { size: 22, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'fit-summary' });
  addFooter(s, n);
  note(s, '明确回答评委：为什么这个作品适合人工智能应用——实践赛道。');
}

async function slide5(p) {
  const s = p.slides.add(); const n = 5; addBg(s, n, C.purple); addHeader(s, n, slideTitles[n-1], '让 AI 从“回答问题”升级为“组织学习”。');
  const principles = [
    ['01 先理解，再规划', '通过多轮目标对话，先洞察真实目标、基础、时间与限制条件。'],
    ['02 以任务推进为核心', '围绕阶段成果和下一步行动组织学习，而不是堆叠知识点。'],
    ['03 以对话组织学习', '通过连续追问、反馈和提示，让学习者在推进中被引导。'],
    ['04 过程可反馈，系统可扩展', '既观察学习状态，也通过前后端分层与 Gateway 架构支持后续扩展。'],
  ];
  principles.forEach((p1, i) => addCard(s, n, 82, 196 + i*112, 1118, 92, p1[0], p1[1], [C.blue, C.purple, C.teal, C.orange][i]));
  addFooter(s, n);
  note(s, '这一页讲理念，不讲具体功能细节。');
}

async function slide6(p) {
  const s = p.slides.add(); const n = 6; addBg(s, n, C.orange); addHeader(s, n, slideTitles[n-1], '项目既服务个人学习，也具备面向教学组织场景扩展的潜力。');
  addShape(s, 'roundRect', 56, 208, 496, 420, '#FFFFFF', C.line, 1, { slideNo: n, role: 'scenes-panel' });
  addText(s, n, '典型应用场景', 82, 234, 200, 28, { size: 22, color: C.title, bold: true, face: FONT.title, role: 'scene-title' });
  addBulletList(s, n, 84, 286, 420, [
    '比赛项目拆解：课程设计、竞赛开发、论文实践',
    '自主学习规划：围绕技能提升、证书目标形成学习路径',
    '跨学科任务推进：技术、产品、设计、表达同步推进',
    '教学辅助与过程追踪：训练营、课程辅导、助教跟踪'
  ], C.orange, 16, 74);
  addShape(s, 'roundRect', 586, 208, 642, 420, '#FFFFFF', C.line, 1, { slideNo: n, role: 'value-panel' });
  addText(s, n, '用户价值', 612, 234, 160, 28, { size: 22, color: C.title, bold: true, face: FONT.title, role: 'value-title' });
  addCard(s, n, 612, 284, 274, 126, '从“想做什么”到“下一步做什么”', '帮助学习者明确行动，降低启动门槛。', C.blue);
  addCard(s, n, 904, 284, 274, 126, '从“模糊目标”到“清晰路径”', '通过 AI 路径规划形成阶段化学习结构。', C.purple);
  addCard(s, n, 612, 430, 274, 126, '从“看资料”到“互动推进”', '对话学习和开放学习支持持续陪练。', C.teal);
  addCard(s, n, 904, 430, 274, 126, '从“做完没”到“状态可视”', '学习状态与成长成就强化过程反馈。', C.orange);
  addFooter(s, n);
  note(s, '场景与价值一一对应，说明项目应用空间。');
}

async function slide7(p) {
  const s = p.slides.add(); const n = 7; addBg(s, n, C.blue); addHeader(s, n, slideTitles[n-1], '围绕目标澄清、路径生成、学习推进、状态反馈构建 AI 驱动闭环。');
  addStep(s, n, 56, 250, 262, 160, '目标对话', '通过多轮问答澄清用户真实目标、基础、时间和限制条件。', 1, C.blue);
  addArrow(s, n, 330, 320, 46, 20, C.blue);
  addStep(s, n, 392, 250, 262, 160, '学习路径生成', '把模糊目标转化为阶段计划、任务拆解与可执行路径。', 2, C.purple);
  addArrow(s, n, 666, 320, 46, 20, C.purple);
  addStep(s, n, 728, 250, 262, 160, '对话学习 / 开放学习', '围绕具体任务持续推进，获得追问、反馈、提示与陪练。', 3, C.teal);
  addArrow(s, n, 1002, 320, 46, 20, C.teal);
  addStep(s, n, 1022, 250, 202, 160, '状态反馈', '跟踪学习状态、成长成就与过程指标，帮助用户调整节奏。', 4, C.orange);
  addShape(s, 'roundRect', 102, 486, 1070, 90, `${C.blue}10`, null, 0, { slideNo: n, role: 'solution-summary-bg' });
  addText(s, n, '知途的关键不是“生成一份计划”，而是把计划、任务、会话和状态反馈组织成一个持续推进的学习系统。', 132, 512, 1010, 38, { size: 20, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'solution-summary' });
  addFooter(s, n);
  note(s, '用一页讲清楚整体解决方案的四大模块。');
}

async function slide8(p) {
  const s = p.slides.add(); const n = 8; addBg(s, n, C.teal); addHeader(s, n, slideTitles[n-1], '用户不是“问完即走”，而是持续留在一个学习工作流中。');
  const steps = [
    '注册/登录', '学习总览', '目标对话', '路径生成', '路径详情', '任务推进', '学习状态', '成长成就'
  ];
  steps.forEach((t, i) => {
    const x = 58 + i*148;
    addShape(s, 'roundRect', x, 288, 126, 92, '#FFFFFF', C.line, 1, { slideNo: n, role: 'flow-node' });
    addShape(s, 'ellipse', x + 42, 246, 42, 42, [C.blue,C.purple,C.teal,C.orange,C.blue,C.purple,C.teal,C.orange][i], null, 0, { slideNo: n, role: 'flow-index' });
    addText(s, n, String(i+1), x + 42, 252, 42, 16, { size: 16, color: '#FFFFFF', bold: true, face: FONT.en, align: 'center', role: 'flow-num' });
    addText(s, n, t, x + 12, 322, 102, 28, { size: 16, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'flow-title' });
    if (i < steps.length -1) addArrow(s, n, x + 126, 324, 22, 12, C.line);
  });
  addShape(s, 'roundRect', 120, 450, 1040, 126, '#FFFFFF', C.line, 1, { slideNo: n, role: 'flow-desc-panel' });
  addBulletList(s, n, 158, 482, 940, [
    '前端主链路覆盖：学习总览、目标对话、学习路径、任务详情、对话学习、开放学习、学习状态、成长成就。',
    '后端业务支撑：目标对话服务、学习路径服务、对话学习服务、学习状态服务、AI Teaching Orchestrator。'
  ], C.teal, 17, 46);
  addFooter(s, n);
  note(s, '这一页是全项目的总地图，要让评委快速理解主链路。');
}

async function slide9(p) {
  const s = p.slides.add(); const n = 9; addBg(s, n, C.purple); addHeader(s, n, slideTitles[n-1], '通过核心页面串起“目标澄清—路径执行—学习反馈”的用户主链路。');
  await addImage(s, n, IMG.home, 58, 198, 360, 214, 'contain', true, 'home-ui');
  await addImage(s, n, IMG.path, 438, 198, 360, 214, 'contain', true, 'path-ui');
  await addImage(s, n, IMG.teach, 818, 198, 360, 214, 'contain', true, 'teach-ui');
  await addImage(s, n, IMG.state, 248, 432, 360, 214, 'contain', true, 'state-ui');
  await addImage(s, n, IMG.eval, 628, 432, 360, 214, 'contain', true, 'eval-ui');
  const caps = [
    ['首页 / 学习总览', '引导用户进入任务导向的学习工作台'],
    ['学习路径页', '将目标拆解为阶段化任务并支持执行'],
    ['对话学习页', '围绕任务持续追问、反馈、提示'],
    ['学习状态页', '可视化进度、节奏与近期状态'],
    ['课程评价页', '形成单次学习总结与长期能力反馈'],
  ];
  [[58,198],[438,198],[818,198],[248,432],[628,432]].forEach((pos, i) => {
    addShape(s, 'roundRect', pos[0]+22, pos[1]+178, 184, 26, '#FFFFFFD9', null, 0, { slideNo: n, role: 'cap-bg' });
    addText(s, n, caps[i][0], pos[0]+28, pos[1]+184, 172, 14, { size: 11, color: C.title, bold: true, face: FONT.body, role: 'cap-title' });
  });
  addFooter(s, n);
  note(s, '功能展示页不按菜单念，而是围绕用户如何被系统引导推进任务来讲。');
}

async function slide10(p) {
  const s = p.slides.add(); const n = 10; addBg(s, n, C.orange); addHeader(s, n, slideTitles[n-1], '项目不仅有用户端，也考虑了平台治理、运维观察与持续迭代能力。');
  await addImage(s, n, IMG.state, 58, 208, 530, 320, 'contain', true, 'ops-state');
  addCard(s, n, 620, 208, 286, 144, '平台概览', '面向管理员展示平台运行状态、统计信息与活动概览。', C.blue);
  addCard(s, n, 924, 208, 286, 144, '用户管理', '支持用户管理与身份体系维护，为后续运营提供基础。', C.purple);
  addCard(s, n, 620, 372, 286, 144, '接口配置', '支持模型接口配置、调用能力治理与环境维护。', C.teal);
  addCard(s, n, 924, 372, 286, 144, '执行日志', '保留平台运行过程信息，便于排查与持续优化。', C.orange);
  addShape(s, 'roundRect', 58, 552, 1152, 76, '#FFFFFF', C.line, 1, { slideNo: n, role: 'ops-summary' });
  addText(s, n, '后台能力的存在，说明知途不是单一页面展示，而是具备“可观测、可维护、可迭代”的平台化工程原型。', 92, 578, 1084, 24, { size: 20, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'ops-summary-text' });
  addFooter(s, n);
  note(s, '如果评委关注工程完整性，这一页是重要支撑。');
}

async function slide11(p) {
  const s = p.slides.add(); const n = 11; addBg(s, n, C.blue); addHeader(s, n, slideTitles[n-1], 'AI 不止生成内容，更组织学习过程。');
  addCard(s, n, 76, 214, 260, 206, '创新点一：目标澄清前置', '不同于直接输出模板化计划，系统先通过多轮对话理解真实目标。', C.blue, '差异化');
  addCard(s, n, 362, 214, 260, 206, '创新点二：路径—任务—会话联动', '学习路径、任务拆解、对话学习连续衔接，形成推进闭环。', C.purple, '闭环化');
  addCard(s, n, 648, 214, 260, 206, '创新点三：学习状态可反馈', '关注学习节奏、理解程度、迁移与负荷，让过程可观测。', C.teal, '过程化');
  addCard(s, n, 934, 214, 260, 206, '创新点四：工程化 AI 平台', '前后端、数据层、Gateway、Agent 模块一体联动，可持续扩展。', C.orange, '平台化');
  addShape(s, 'roundRect', 126, 472, 1028, 114, `${C.blue}10`, null, 0, { slideNo: n, role: 'innovation-summary-bg' });
  addText(s, n, '相比普通聊天式 AI，知途更强调“先理解目标—再组织路径—再推动执行—再反馈状态”的完整学习工作流。', 164, 506, 952, 46, { size: 21, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'innovation-summary' });
  addFooter(s, n);
  note(s, '这一页既讲创新点，也讲差异化。');
}

async function slide12(p) {
  const s = p.slides.add(); const n = 12; addBg(s, n, C.teal); addHeader(s, n, slideTitles[n-1], '前后端分离 + AI Gateway 编排，支撑完整业务闭环与后续能力扩展。');
  const layers = [
    ['用户浏览器', '学习者 / 管理员', C.blue, 184],
    ['Vue 前端应用', '页面、路由、状态管理、设计系统', C.purple, 296],
    ['Express API', '鉴权、学习路径、目标对话、状态跟踪等路由服务', C.teal, 408],
    ['Prisma + 数据库', 'SQLite 开发环境 / PostgreSQL 扩展能力', C.orange, 520],
  ];
  layers.forEach(l => {
    addShape(s, 'roundRect', 90, l[3], 420, 108, '#FFFFFF', C.line, 1, { slideNo: n, role: 'layer-left' });
    addText(s, n, l[0], 120, l[3]+22, 220, 24, { size: 22, color: l[2], bold: true, face: FONT.title, role: 'layer-title' });
    addText(s, n, l[1], 120, l[3]+58, 320, 20, { size: 14, color: C.body, face: FONT.body, role: 'layer-desc' });
  });
  addShape(s, 'roundRect', 690, 268, 458, 132, '#FFFFFF', C.line, 1, { slideNo: n, role: 'gateway' });
  addText(s, n, 'EduClaw Gateway', 724, 294, 260, 24, { size: 24, color: C.blue, bold: true, face: FONT.title, role: 'gateway-title' });
  addText(s, n, '统一接入模型、Agent、Skill、Plugin，作为 AI 能力编排入口。', 724, 334, 360, 34, { size: 15, color: C.body, face: FONT.body, role: 'gateway-desc' });
  addShape(s, 'roundRect', 690, 444, 138, 88, `${C.blue}12`, null, 0, { slideNo: n, role: 'ai-box1' });
  addShape(s, 'roundRect', 850, 444, 138, 88, `${C.purple}12`, null, 0, { slideNo: n, role: 'ai-box2' });
  addShape(s, 'roundRect', 1010, 444, 138, 88, `${C.teal}12`, null, 0, { slideNo: n, role: 'ai-box3' });
  addText(s, n, '模型', 730, 476, 60, 18, { size: 20, color: C.blue, bold: true, face: FONT.title, align: 'center', role: 'ai-t1' });
  addText(s, n, 'Agent', 890, 476, 60, 18, { size: 20, color: C.purple, bold: true, face: FONT.title, align: 'center', role: 'ai-t2' });
  addText(s, n, 'Skill/Plugin', 1024, 476, 110, 18, { size: 18, color: C.teal, bold: true, face: FONT.title, align: 'center', role: 'ai-t3' });
  addArrow(s, n, 522, 330, 70, 18, C.line);
  addArrow(s, n, 520, 474, 72, 18, C.line);
  addFooter(s, n);
  note(s, '架构图不必太复杂，重点突出层次与 Gateway 位置。');
}

async function slide13(p) {
  const s = p.slides.add(); const n = 13; addBg(s, n, C.purple); addHeader(s, n, slideTitles[n-1], '从前端体验、后端服务到数据模型，形成完整工程落地链路。');
  addCard(s, n, 70, 220, 356, 346, '前端实现', 'Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus\n\n建立统一 aa 设计系统与全局样式 token，支撑沉浸式学习工作流。', C.blue, '体验层');
  addCard(s, n, 462, 220, 356, 346, '后端实现', 'Node.js + Express + TypeScript + Prisma + JWT + bcrypt\n\n围绕目标对话、学习路径、对话学习、学习状态等服务模块分层组织。', C.purple, '服务层');
  addCard(s, n, 854, 220, 356, 346, '数据与能力支撑', '核心实体包括用户、学习目标、学习路径、任务、学习会话、学习状态、成就记录与智能体调用日志。', C.teal, '数据层');
  addShape(s, 'roundRect', 146, 600, 990, 56, '#FFFFFF', C.line, 1, { slideNo: n, role: 'landing-summary' });
  addText(s, n, '这说明项目并非概念 Demo，而是具备前后端、数据库、AI 能力接入与业务流程联动的实践型工程原型。', 176, 617, 930, 22, { size: 19, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'landing-summary-text' });
  addFooter(s, n);
  note(s, '这一页回答“你们究竟做了多少工程工作”。');
}

async function slide14(p) {
  const s = p.slides.add(); const n = 14; addBg(s, n, C.orange); addHeader(s, n, slideTitles[n-1], '作品当前已具备可运行、可演示、可扩展的原型能力。');
  addCard(s, n, 58, 210, 270, 136, '完整工程结构', '前后端分离架构已建立，代码、文档与部署结构完整。', C.blue);
  addCard(s, n, 348, 210, 270, 136, '主链路已落地', '用户主链路与后台主链路已具备基本可交互性。', C.purple);
  addCard(s, n, 638, 210, 270, 136, '关键问题已修复', '对话学习 taskId/pathId 参数链路缺失问题已修复。', C.teal);
  addCard(s, n, 928, 210, 270, 136, '基础验证通过', '前端最近一次 npm run build 已通过。', C.orange);
  await addImage(s, n, IMG.state, 118, 386, 470, 258, 'contain', true, 'state-proof');
  await addImage(s, n, IMG.eval, 694, 386, 470, 258, 'contain', true, 'eval-proof');
  addFooter(s, n);
  note(s, '这一页强调完成度，不夸张，但要清晰可信。');
}

async function slide15(p) {
  const s = p.slides.add(); const n = 15; addBg(s, n, C.blue); addHeader(s, n, slideTitles[n-1], '既有清晰差异化，也具备面向教育实践场景的推广潜力。');
  addShape(s, 'roundRect', 56, 204, 720, 416, '#FFFFFF', C.line, 1, { slideNo: n, role: 'compare-panel' });
  addText(s, n, '差异化对比', 84, 230, 140, 26, { size: 22, color: C.title, bold: true, face: FONT.title, role: 'cmp-title' });
  const rows = [
    ['目标理解', '单轮提问', '多轮目标澄清'],
    ['输出形式', '单次回答', '阶段化学习路径'],
    ['任务推进', '用户自行组织', '系统引导推进'],
    ['学习反馈', '结果导向', '过程可观测'],
    ['系统形态', '单点工具', '平台化原型'],
  ];
  addShape(s, 'roundRect', 84, 274, 160, 48, C.softBlue, null, 0, { slideNo: n, role: 'th1' });
  addShape(s, 'roundRect', 252, 274, 214, 48, '#FFF4E9', null, 0, { slideNo: n, role: 'th2' });
  addShape(s, 'roundRect', 474, 274, 260, 48, C.softTeal, null, 0, { slideNo: n, role: 'th3' });
  addText(s, n, '维度', 84, 288, 160, 16, { size: 16, color: C.title, bold: true, face: FONT.body, align: 'center', role: 'th-text' });
  addText(s, n, '普通聊天式 AI', 252, 288, 214, 16, { size: 16, color: C.orange, bold: true, face: FONT.body, align: 'center', role: 'th-text2' });
  addText(s, n, '知途 KnowPath', 474, 288, 260, 16, { size: 16, color: C.teal, bold: true, face: FONT.body, align: 'center', role: 'th-text3' });
  rows.forEach((r, i) => {
    const y = 332 + i * 54;
    [160,214,260].forEach((w, j) => addShape(s, 'roundRect', [84,252,474][j], y, w, 42, '#FAFBFF', C.line, 1, { slideNo: n, role: 'table-cell' }));
    addText(s, n, r[0], 92, y + 11, 144, 16, { size: 14, color: C.title, bold: true, face: FONT.body, align: 'center', role: 'row-dim' });
    addText(s, n, r[1], 260, y + 11, 198, 16, { size: 14, color: C.body, face: FONT.body, align: 'center', role: 'row-old' });
    addText(s, n, r[2], 482, y + 11, 244, 16, { size: 14, color: C.title, bold: true, face: FONT.body, align: 'center', role: 'row-new' });
  });
  addShape(s, 'roundRect', 816, 204, 392, 416, '#FFFFFF', C.line, 1, { slideNo: n, role: 'future-panel' });
  addText(s, n, '应用前景', 844, 230, 160, 26, { size: 22, color: C.title, bold: true, face: FONT.title, role: 'future-title' });
  addBulletList(s, n, 846, 286, 300, [
    '校内课程项目与创新训练场景',
    '竞赛备赛与项目制学习场景',
    '教学辅助与训练营过程跟踪场景',
    '后续可拓展多智能体协同教学能力'
  ], C.blue, 16, 66);
  addFooter(s, n);
  note(s, '这一页承担差异化和推广价值两项任务。');
}

async function slide16(p) {
  const s = p.slides.add(); const n = 16; addBg(s, n, C.purple);
  addShape(s, 'roundRect', 144, 152, 992, 404, '#FFFFFFD9', null, 0, { slideNo: n, role: 'end-panel' });
  addText(s, n, '总结', 590, 196, 100, 32, { size: 28, color: C.purple, bold: true, face: FONT.title, align: 'center', role: 'end-title' });
  addText(s, n, '让 AI 真正帮助学习者持续推进复杂任务', 240, 246, 800, 48, { size: 30, color: C.title, bold: true, face: FONT.title, align: 'center', role: 'end-main' });
  addBulletList(s, n, 244, 334, 760, [
    '知途聚焦真实学习痛点，面向复杂任务学习场景。',
    '项目构建了“目标澄清 → 路径规划 → 学习推进 → 状态反馈”的完整闭环。',
    '作品已具备较完整的 AI 应用实践原型基础，兼具展示价值与产品化潜力。'
  ], C.purple, 20, 66);
  addText(s, n, '感谢各位评委老师聆听，期待批评指正。', 316, 592, 650, 26, { size: 18, color: C.muted, face: FONT.body, align: 'center', role: 'thanks' });
  addFooter(s, n);
  note(s, '结尾回到一句总主张：让 AI 不只是回答问题，而是真正帮助学习者持续推进复杂任务。');
}

async function createDeck() {
  await ensureDirs();
  const p = Presentation.create({ slideSize: { width: W, height: H } });
  p.theme.colorScheme = {
    name: 'KnowPath',
    themeColors: { accent1: C.blue, accent2: C.purple, accent3: C.teal, bg1: C.bg, tx1: C.title, tx2: C.body }
  };
  await slide1(p); await slide2(p); await slide3(p); await slide4(p); await slide5(p); await slide6(p); await slide7(p); await slide8(p); await slide9(p); await slide10(p); await slide11(p); await slide12(p); await slide13(p); await slide14(p); await slide15(p); await slide16(p);
  return p;
}

async function saveBlobToFile(blob, filePath) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function writeInspectArtifact(presentation) {
  const records = [{ kind: 'deck', id: DECK_ID, slideCount: presentation.slides.count, slideSize: { width: W, height: H } }];
  presentation.slides.items.forEach((slide, index) => records.push({ kind: 'slide', slide: index + 1, id: slide?.id || `slide-${index+1}` }));
  records.push(...inspectRecords);
  await fs.writeFile(INSPECT_PATH, records.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
}

async function currentRenderLoopCount() {
  const logPath = path.join(VERIFICATION_DIR, 'render_verify_loops.ndjson');
  try {
    const previous = await fs.readFile(logPath, 'utf8');
    return previous.split(/\r?\n/).filter(line => line.trim()).length;
  } catch {
    return 0;
  }
}

async function appendRenderVerifyLoop(presentation, previewPaths, pptxPath) {
  const logPath = path.join(VERIFICATION_DIR, 'render_verify_loops.ndjson');
  const priorCount = await currentRenderLoopCount();
  const record = { kind: 'render_verify_loop', deckId: DECK_ID, loop: priorCount + 1, maxLoops: MAX_RENDER_VERIFY_LOOPS, timestamp: new Date().toISOString(), slideCount: presentation.slides.count, previewCount: previewPaths.length, previewDir: PREVIEW_DIR, inspectPath: INSPECT_PATH, pptxPath };
  await fs.appendFile(logPath, JSON.stringify(record) + '\n', 'utf8');
}

async function verifyAndExport(presentation) {
  const nextLoop = (await currentRenderLoopCount()) + 1;
  if (nextLoop > MAX_RENDER_VERIFY_LOOPS) throw new Error('render loop cap reached');
  await writeInspectArtifact(presentation);
  const previewPaths = [];
  for (let idx = 0; idx < presentation.slides.items.length; idx += 1) {
    const slide = presentation.slides.items[idx];
    const preview = await presentation.export({ slide, format: 'png', scale: 1 });
    const previewPath = path.join(PREVIEW_DIR, `slide-${String(idx + 1).padStart(2, '0')}.png`);
    await saveBlobToFile(preview, previewPath);
    previewPaths.push(previewPath);
  }
  const pptxBlob = await PresentationFile.exportPptx(presentation);
  const pptxPath = path.join(OUT_DIR, 'output.pptx');
  await pptxBlob.save(pptxPath);
  await appendRenderVerifyLoop(presentation, previewPaths, pptxPath);
  return { pptxPath, previewPaths };
}

const deck = await createDeck();
const result = await verifyAndExport(deck);
console.log(result.pptxPath);


