import Image from 'next/image';
import { SIZES } from '../data/sizes';
import Link from 'next/link';
import { BrainIcon, HeartIcon, StrengthIcon } from '../components/Icons';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { css } from '../data/style';
import './HomePage.css';

const BENEFITS = [
  { icon: <StrengthIcon />, title: 'แข็งแรงและทรงตัวดี', body: 'ขึ้นกล่อง ทรงตัว เปลี่ยนท่า ช่วยเสริมความแข็งแรง การทรงตัว และการรับรู้ร่างกายของตัวเอง' },
  { icon: <BrainIcon />, title: 'สมองได้ทำงาน', body: 'โจทย์การเคลื่อนไหวแบบใหม่ ให้หมาได้คิด ลองผิดลองถูก และใช้พลังงานอย่างสร้างสรรค์' },
  { icon: <HeartIcon />, title: 'ใกล้กันมากขึ้น', body: 'ทุกครั้งที่เล่นและฝึกด้วยกัน คือเวลาคุณภาพที่ทำให้คุณกับหมาเข้าใจกันมากขึ้น' },
];

const CATEGORY_CARDS = [
  { to: '/shop?cat=sb', bg: 'var(--sky-tint)', img: img.dogsOnBoxes, alt: 'หมาสองตัวยืนบน Target Box และ Oct Box', title: 'Strength & Balance', body: 'แผ่นกระดาน กล่องยืน ฐานเอียง ฐานแปดเหลี่ยม ผลิตเองทุกชิ้น', from: 'เริ่ม ฿390' },
  { to: '/shop?cat=ip', bg: 'var(--orange-tint)', img: img.beagleFlirt, alt: 'บีเกิ้ลวิ่งไล่เหยื่อ Flirt Pole บนสนามหญ้า', title: 'Interactive Play', body: 'Flirt Pole ไซส์ S และ M เหยื่อ 3 สี เหลือง ฟ้า ชมพู ปลุกสัญชาตญาณการไล่ล่า', from: 'เริ่ม ฿790' },
  { to: '/shop?cat=tug', bg: 'var(--sand)', img: img.sheepskinBungee, alt: 'Sheepskin Bungee สองแบบ', title: 'Tug Toys', body: 'ของเล่นดึงจากขนแกะและขนกระต่ายแท้ สำหรับหมาที่ชอบกัด ชอบดึงแรง ๆ', from: 'เริ่ม ฿1,450', cutout: true },
];

const STATS = [
  { big: <>200 <small>กก.</small></>, body: 'รับแรงกระแทกได้ถึง 200 กิโลกรัม' },
  { big: 'EPDM', body: 'ยางเกรดสนามเด็กเล่น ลายกันลื่น นุ่มรับแรง' },
  { big: 'สถาปนิก', body: 'ออกแบบโครงสร้างโดยสถาปนิก ให้รับน้ำหนักได้อย่างมั่นคง' },
];

const TRAINING = [
  { n: '01', tone: 'tag--sky', title: 'Obedience Training', body: 'ฝึก Place, Stay, Settle บนแผ่นกระดาน ให้หมามีจุดยืนที่ชัดเจนและนิ่งได้นานขึ้น' },
  { n: '02', tone: 'tag--orange', title: 'Movement Puzzles', body: 'โจทย์ให้หมาคิดว่าจะวางเท้ายังไง เดินข้าม ถอยหลังขึ้นกล่อง หรือหมุนตัวรอบฐาน' },
  { n: '03', tone: 'tag--sand', title: 'Canine Fitness', body: 'เสริมกล้ามเนื้อ การทรงตัว และการประสานงานของร่างกาย ตั้งแต่ท่าง่ายไปจนท่าท้าทาย' },
];

// TODO: replace with real customer photos (catalog images used as placeholders).
const UGC = [img.customer1, img.placeBoard, img.jumpBox, img.dogsOnBoxes, img.beagleFlirt, img.cockerOctBox];

export function HomePage() {
  return (
    <>
      <SiteHeader showNav />
      <main className="home">
        <section className="container home-hero">
          <p className="eyebrow" style={{ letterSpacing: '0.16em', marginBottom: 14 }}>Active Play &amp; Fitness</p>
          <h1 className="home-hero__title">
            Building Bonds
            <br />
            Through Play &amp; Movement
          </h1>
          <p className="lead home-hero__lead">
            อุปกรณ์ฟิตเนสและของเล่นฝึกสุนัขจากไทย ชวนคนกับหมาออกมาขยับ เรียนรู้ และเล่นด้วยกันมากขึ้น
          </p>
          <div className="home-hero__ctas">
            <Link href="/shop" className="btn btn--primary" style={{ padding: '0 28px' }}>เลือกซื้ออุปกรณ์</Link>
            <Link href="/custom" className="btn btn--outline">สั่งทำขนาดพิเศษ</Link>
          </div>
        </section>
        <div className="container container--wide">
          <Image priority sizes="(min-width: 1360px) 1336px, 100vw" src={img.heroSet} alt="Oct Box, Target Box และ Place Board วางบนสนามหญ้าตอนแดดเย็น" className="photo home-hero__img" />
        </div>

        <section className="container home-pad" style={{ paddingTop: 88, paddingBottom: 40 }}>
          <p className="eyebrow">ทำไมหมาต้องออกกำลัง</p>
          <h2 className="title title--xl" style={{ maxWidth: 760 }}>การเล่นเป็นมากกว่าความสนุก คือโอกาสสร้างความสัมพันธ์</h2>
          <p className="lead" style={{ marginTop: 18, maxWidth: 620 }}>
            ตั้งแต่ลูกหมาขี้เล่น หมาวัยทำงาน จนถึงหมาสูงวัย ทุกช่วงวัยมีวิธีใหม่ ๆ ให้คนกับหมาได้ใช้เวลาด้วยกัน
          </p>
          <div className="auto-grid" style={css({ '--gap': '28px', marginTop: 40 })}>
            {BENEFITS.map((b) => (
              <div key={b.title} className="stack">
                {b.icon}
                <h3 className="heading">{b.title}</h3>
                <p className="body">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container home-pad" style={{ paddingTop: 48, paddingBottom: 88 }}>
          <h2 className="title" style={{ marginBottom: 28 }}>เลือกตามแบบการเล่น</h2>
          <div className="auto-grid" style={css({ '--min': '280px' })}>
            {CATEGORY_CARDS.map((c) => (
              <Link key={c.title} href={c.to} className="cat-card" style={{ background: c.bg }}>
                {c.cutout ? (
                  <div className="cat-card__media cat-card__media--cutout">
                    <Image src={c.img} alt={c.alt} sizes={SIZES.third} />
                  </div>
                ) : (
                  <Image src={c.img} alt={c.alt} className="cat-card__media" sizes={SIZES.third} />
                )}
                <div className="cat-card__body">
                  <h3>{c.title}</h3>
                  <p className="body" style={{ lineHeight: 1.6 }}>{c.body}</p>
                  <p className="cat-card__price">
                    {c.from} <span>ดูสินค้า</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="on-dark">
          <div className="container home-pad" style={{ paddingTop: 88, paddingBottom: 72 }}>
            <p className="eyebrow">วัสดุ</p>
            <h2 className="title title--xl" style={{ maxWidth: 780 }}>แข็งแรงพอให้กระโดด มั่นคงพอให้ไว้ใจ</h2>
            <p className="lead" style={{ marginTop: 18, maxWidth: 620 }}>
              ไม้ยางพาราเกรดส่งออก ปิดผิวด้วยยาง EPDM เกรดเดียวกับพื้นสนามเด็กเล่น ผิวมีลายช่วยยึดเกาะและลดการลื่นไถล
            </p>
            <Image sizes={SIZES.full} src={img.epdmCloseup} alt="ผิวยาง EPDM สีฟ้าและส้มบนกล่องไม้ยางพารา ระยะใกล้" className="photo" style={{ marginTop: 36, aspectRatio: '4 / 3', maxHeight: 640, borderRadius: 20 }} />
            <div className="auto-grid" style={css({ '--min': '220px', gap: '28px 32px', marginTop: 40 })}>
              {STATS.map((s) => (
                <div key={s.body} className="stat">
                  <p className="stat__big">{s.big}</p>
                  <p className="stat__body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container home-pad" style={{ paddingTop: 88, paddingBottom: 40 }}>
          <p className="eyebrow">ต่อเป็นชุดได้</p>
          <h2 className="title title--xl" style={{ maxWidth: 760 }}>ชิ้นเดียวก็เล่นได้ ต่อกันยิ่งสนุก</h2>
          <ol className="auto-grid steps" style={css({ '--min': '300px', gap: '36px 20px', marginTop: 40 })}>
            <li>
              <div className="steps__media" style={{ gap: 8, padding: 20 }}>
                <Image sizes="180px" src={img.targetBox} alt="Target Box สูง 10 cm" className="cutout" style={{ width: '48%' }} />
                <Image sizes="180px" src={img.slantBox} alt="Slant Box 20 องศา" className="cutout" style={{ width: '48%' }} />
              </div>
              <p className="steps__n">ขั้นที่ 1</p>
              <h3>เลือกฐาน</h3>
              <p className="body">วางกล่องยืน Target Box หรือฐานเอียง Slant Box ตามท่าที่อยากฝึก</p>
            </li>
            <li>
              <div className="steps__media">
                <Image sizes={SIZES.third} src={img.magnets} alt="ด้านล่างแผ่นกระดานและกล่อง มีแม่เหล็กฝังอยู่" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p className="steps__n">ขั้นที่ 2</p>
              <h3>วางแผ่นกระดาน</h3>
              <p className="body">Place Board ที่เลือกติดแม่เหล็กไว้ด้านล่าง วางพาดลงบนฐาน</p>
            </li>
            <li>
              <div className="steps__media" style={{ padding: 24 }}>
                <div className="bridge" aria-hidden="true">
                  <div className="bridge__board" />
                  <div className="bridge__legs"><div /><div /></div>
                </div>
              </div>
              <p className="steps__n">ขั้นที่ 3</p>
              <h3>แม่เหล็กยึดเข้าที่</h3>
              <p className="body">ไม่เลื่อน ไม่ไถล ได้สะพาน ทางลาด หรือแท่นยืนสูงขึ้นในไม่กี่วินาที</p>
            </li>
          </ol>
        </section>

        <section className="container home-pad" style={{ paddingTop: 48, paddingBottom: 88 }}>
          <h2 className="title">ใช้ฝึกได้ 3 แบบ</h2>
          <div className="auto-grid" style={css({ '--min': '280px', marginTop: 28 })}>
            {TRAINING.map((t) => (
              <div key={t.n} className="outline-card">
                <span className={`tag ${t.tone}`} style={{ letterSpacing: '0.06em' }}>{t.n}</span>
                <h3 className="num-display" style={{ marginTop: 4, fontWeight: 400, fontSize: 24 }}>{t.title}</h3>
                <p className="body">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: 'var(--sand)' }}>
          <div className="container home-pad split split--center" style={{ paddingBlock: 88 }}>
            <Image sizes={SIZES.half} src={img.cockerOctBox} alt="ค็อกเกอร์สแปเนียลยืนบน Oct Box กลางแดด" className="photo" style={{ aspectRatio: '4 / 3', borderRadius: 20 }} />
            <div>
              <p className="eyebrow">เรื่องของเรา</p>
              <h2 className="title" style={{ lineHeight: 1.18 }}>ทดสอบกับหมาจริง ก่อนถึงบ้านคุณ</h2>
              <p className="lead" style={{ marginTop: 18, lineHeight: 1.8 }}>
                เราเชื่อว่าคุณภาพชีวิตที่ดีมาจากการได้ใช้เวลาที่มีความหมายด้วยกัน Buildabond ได้แรงบันดาลใจจากกิจกรรมทั่วโลก แล้วลองทำ ทดสอบ และพัฒนาทุกชิ้นกับหมาของทีมและคอมมูนิตี้คนรักหมา เพื่อให้ทุกคู่ได้ค้นพบวิธีเล่น ขยับ และเติบโตไปด้วยกัน
              </p>
              <p className="strong" style={{ marginTop: 18, fontSize: 15 }}>Team Buildabond</p>
            </div>
          </div>
        </section>

        <section className="container home-pad" style={{ paddingBlock: 88 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h2 className="title">จากบ้านของลูกค้า</h2>
              <p className="body" style={{ marginTop: 8 }}>แท็ก #buildabond เพื่อร่วมแชร์ช่วงเวลาของคุณ</p>
            </div>
            <a href="https://www.instagram.com/" style={{ fontSize: 15, fontWeight: 500 }}>ดูบน Instagram</a>
          </div>
          <div className="auto-fill" style={css({ '--gap': '8px', marginTop: 24 })}>
            {UGC.map((src, i) => (
              <Image key={i} sizes="(min-width: 900px) 200px, 50vw" src={src} alt="ภาพลูกค้า (ตัวอย่าง)" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 14 }} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
