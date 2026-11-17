'use client';

import Image from 'next/image';
import { SIZES } from '../data/sizes';
import Link from 'next/link';
import { BrainIcon, HeartIcon, StrengthIcon } from '../components/Icons';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { img } from '../data/images';
import { css } from '../data/style';
import { useI18n } from '../i18n/LocaleProvider';
import './HomePage.css';

const BENEFIT_ICONS = [<StrengthIcon key="s" />, <BrainIcon key="b" />, <HeartIcon key="h" />];

const CATEGORY_CARDS = [
  { to: '/shop?cat=sb', bg: 'var(--sky-tint)', img: img.dogsOnBoxes, title: 'Strength & Balance' },
  { to: '/shop?cat=ip', bg: 'var(--orange-tint)', img: img.beagleFlirt, title: 'Interactive Play' },
  { to: '/shop?cat=tug', bg: 'var(--sand)', img: img.sheepskinBungee, title: 'Tug Toys', cutout: true },
];

const TRAINING = [
  { n: '01', tone: 'tag--sky', title: 'Obedience Training' },
  { n: '02', tone: 'tag--orange', title: 'Movement Puzzles' },
  { n: '03', tone: 'tag--sand', title: 'Canine Fitness' },
];

// TODO: replace with real customer photos (catalog images used as placeholders).
const UGC = [img.customer1, img.placeBoard, img.jumpBox, img.dogsOnBoxes, img.beagleFlirt, img.cockerOctBox];

export function HomePage() {
  const { t } = useI18n();
  const h = t.home;
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
          <p className="lead home-hero__lead">{h.lead}</p>
          <div className="home-hero__ctas">
            <Link href="/shop" className="btn btn--primary" style={{ padding: '0 28px' }}>{h.shopCta}</Link>
            <Link href="/custom" className="btn btn--outline">{h.customCta}</Link>
          </div>
        </section>
        <div className="container container--wide">
          <Image priority sizes="(min-width: 1360px) 1336px, 100vw" src={img.heroSet} alt={h.heroAlt} className="photo home-hero__img" />
        </div>

        <section className="container home-pad" style={{ paddingTop: 88, paddingBottom: 40 }}>
          <p className="eyebrow">{h.whyEyebrow}</p>
          <h2 className="title title--xl" style={{ maxWidth: 760 }}>{h.whyTitle}</h2>
          <p className="lead" style={{ marginTop: 18, maxWidth: 620 }}>{h.whyLead}</p>
          <div className="auto-grid" style={css({ '--gap': '28px', marginTop: 40 })}>
            {h.benefits.map((b, i) => (
              <div key={b.title} className="stack">
                {BENEFIT_ICONS[i]}
                <h3 className="heading">{b.title}</h3>
                <p className="body">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container home-pad" style={{ paddingTop: 48, paddingBottom: 88 }}>
          <h2 className="title" style={{ marginBottom: 28 }}>{h.byPlayTitle}</h2>
          <div className="auto-grid" style={css({ '--min': '280px' })}>
            {CATEGORY_CARDS.map((c, i) => (
              <Link key={c.title} href={c.to} className="cat-card" style={{ background: c.bg }}>
                {c.cutout ? (
                  <div className="cat-card__media cat-card__media--cutout">
                    <Image src={c.img} alt={h.categories[i].alt} sizes={SIZES.third} />
                  </div>
                ) : (
                  <Image src={c.img} alt={h.categories[i].alt} className="cat-card__media" sizes={SIZES.third} />
                )}
                <div className="cat-card__body">
                  <h3>{c.title}</h3>
                  <p className="body" style={{ lineHeight: 1.6 }}>{h.categories[i].body}</p>
                  <p className="cat-card__price">
                    {h.categories[i].from} <span>{t.common.viewProducts}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="on-dark">
          <div className="container home-pad" style={{ paddingTop: 88, paddingBottom: 72 }}>
            <p className="eyebrow">{h.materialEyebrow}</p>
            <h2 className="title title--xl" style={{ maxWidth: 780 }}>{h.materialTitle}</h2>
            <p className="lead" style={{ marginTop: 18, maxWidth: 620 }}>{h.materialLead}</p>
            <Image sizes={SIZES.full} src={img.epdmCloseup} alt={h.materialAlt} className="photo" style={{ marginTop: 36, aspectRatio: '4 / 3', maxHeight: 640, borderRadius: 20 }} />
            <div className="auto-grid" style={css({ '--min': '220px', gap: '28px 32px', marginTop: 40 })}>
              {h.stats.map((s) => (
                <div key={s.body} className="stat">
                  <p className="stat__big">{s.big}{s.unit && <> <small>{s.unit}</small></>}</p>
                  <p className="stat__body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container home-pad" style={{ paddingTop: 88, paddingBottom: 40 }}>
          <p className="eyebrow">{h.setEyebrow}</p>
          <h2 className="title title--xl" style={{ maxWidth: 760 }}>{h.setTitle}</h2>
          <ol className="auto-grid steps" style={css({ '--min': '300px', gap: '36px 20px', marginTop: 40 })}>
            <li>
              <div className="steps__media" style={{ gap: 8, padding: 20 }}>
                <Image sizes="180px" src={img.targetBox} alt={h.stepAlts.target} className="cutout" style={{ width: '48%' }} />
                <Image sizes="180px" src={img.slantBox} alt={h.stepAlts.slant} className="cutout" style={{ width: '48%' }} />
              </div>
              <p className="steps__n">{h.step(1)}</p>
              <h3>{h.steps[0].title}</h3>
              <p className="body">{h.steps[0].body}</p>
            </li>
            <li>
              <div className="steps__media">
                <Image sizes={SIZES.third} src={img.magnets} alt={h.stepAlts.magnets} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p className="steps__n">{h.step(2)}</p>
              <h3>{h.steps[1].title}</h3>
              <p className="body">{h.steps[1].body}</p>
            </li>
            <li>
              <div className="steps__media" style={{ padding: 24 }}>
                <div className="bridge" aria-hidden="true">
                  <div className="bridge__board" />
                  <div className="bridge__legs"><div /><div /></div>
                </div>
              </div>
              <p className="steps__n">{h.step(3)}</p>
              <h3>{h.steps[2].title}</h3>
              <p className="body">{h.steps[2].body}</p>
            </li>
          </ol>
        </section>

        <section className="container home-pad" style={{ paddingTop: 48, paddingBottom: 88 }}>
          <h2 className="title">{h.trainingTitle}</h2>
          <div className="auto-grid" style={css({ '--min': '280px', marginTop: 28 })}>
            {TRAINING.map((x, i) => (
              <div key={x.n} className="outline-card">
                <span className={`tag ${x.tone}`} style={{ letterSpacing: '0.06em' }}>{x.n}</span>
                <h3 className="num-display" style={{ marginTop: 4, fontWeight: 400, fontSize: 24 }}>{x.title}</h3>
                <p className="body">{h.training[i]}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: 'var(--sand)' }}>
          <div className="container home-pad split split--center" style={{ paddingBlock: 88 }}>
            <Image sizes={SIZES.half} src={img.cockerOctBox} alt={h.storyAlt} className="photo" style={{ aspectRatio: '4 / 3', borderRadius: 20 }} />
            <div>
              <p className="eyebrow">{h.storyEyebrow}</p>
              <h2 className="title" style={{ lineHeight: 1.18 }}>{h.storyTitle}</h2>
              <p className="lead" style={{ marginTop: 18, lineHeight: 1.8 }}>{h.storyBody}</p>
              <p className="strong" style={{ marginTop: 18, fontSize: 15 }}>Team Buildabond</p>
            </div>
          </div>
        </section>

        <section className="container home-pad" style={{ paddingBlock: 88 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h2 className="title">{h.ugcTitle}</h2>
              <p className="body" style={{ marginTop: 8 }}>{h.ugcLead}</p>
            </div>
            <a href="https://www.instagram.com/" style={{ fontSize: 15, fontWeight: 500 }}>{h.ugcLink}</a>
          </div>
          <div className="auto-fill" style={css({ '--gap': '8px', marginTop: 24 })}>
            {UGC.map((src, i) => (
              <Image key={i} sizes="(min-width: 900px) 200px, 50vw" src={src} alt={h.ugcAlt} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 14 }} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
