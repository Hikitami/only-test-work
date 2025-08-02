import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import styles from './timelineSlider.module.scss';

import { SwiperData, timelineSlides } from '../../mock/slides';
import { SwiperArrow, Arrow, ArrowMobile } from '../../shared/ui';

import { Swiper as SwiperType } from 'swiper/types';
import { useScreenSize } from '../../hooks/useScreenSize';

const SwiperNavButtons = ({
  swiperInstance,
  start,
  end
}: {
  swiperInstance: SwiperType | null,
  start: boolean,
  end: boolean
}) => {
  if (swiperInstance == null) return
  return (
    <div className={styles.swiperNavArrows}>
      <button className={`${styles.swiperNavArrow} ${styles.swiperNavArrowPrev} ${start ? styles.disabled : ''}`} onClick={() => swiperInstance.slidePrev()}><SwiperArrow /></button>
      <button className={`${styles.swiperNavArrow} ${styles.swiperNavArrowNext} ${end ? styles.disabled : ''}`} onClick={() => swiperInstance.slideNext()}><SwiperArrow /></button>
    </div>
  );
};

const CircularDotsSlider = ({
  slidesCount,
  activeIndex,
  onDotClick
}: {
  slidesCount: number;
  activeIndex: number;
  onDotClick: (index: number) => void
}) => {
  const dotsContainerRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<Array<{ x: number; y: number; index: number }>>([]);

  useEffect(() => {
    if (!dotsContainerRef.current || slidesCount === 0) return;

    const containerSize = dotsContainerRef.current.offsetWidth;
    const radius = containerSize / 2 - 15;
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    const newDots = [];

    for (let i = 0; i < slidesCount; i++) {
      const angle = (2 * Math.PI / slidesCount) * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      newDots.push({ x, y, index: i });
    }

    setDots(newDots);
  }, [slidesCount]);

  return (
    <div className={styles.circularDotsContainer} ref={dotsContainerRef} style={{ transform: `rotate(-${(360 / dots.length) * activeIndex}deg)` }}>
      <div className={styles.circularDotsCircle} />
      {dots.map((dot, i) => (
        <div key={dot.index} className={`${styles.circularDotContainer} ${activeIndex === dot.index ? styles.active : ''}`} style={{
          left: `${dot.x}px`,
          top: `${dot.y}px`,
          transform: `translate(-50%, -50%) rotate(${((360 / dots.length) * activeIndex) - 30}deg)`,
        }}>
          <button
            className={styles.circularDot}
            onClick={() => onDotClick(dot.index)}
            area-label={`Переход к слайду: ${i + 1}`}
          >
          </button>
          <span className={styles.circularDotCount}>{i + 1}</span>
          <div className={styles.circularDotTitle}>
            {timelineSlides[i].title}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TimelineSlider = ({timelineSlides}: {timelineSlides: SwiperData[]}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(false)
  const [prevActiveSlide, setPrevActiveSlide] = useState(0)
  const swiperRef = useRef<any>(null)
  const firstLoading = useRef(true)
  const [start, setStart] = useState(false)
  const [end, setEnd] = useState(false)
  const [year, setYear] = useState<{
    start: number;
    end: number;
  }>({
    start: timelineSlides[0].startDate,
    end: timelineSlides[0].endDate
  })
  const timer = useRef<NodeJS.Timeout>(null);
  const timerFade = useRef<NodeJS.Timeout>(null);
  const delay = 700;
  const screenSize = useScreenSize()

  const handleSetActiveSlideClick = (index: number) => {
    setActiveSlide(index)
  };

  useEffect(() => {
    const newStart = timelineSlides[activeSlide].startDate;
    const newEnd = timelineSlides[activeSlide].endDate;
    const stepDelay = (Math.abs(year.start - newStart) < Math.abs(year.end - newEnd)) ? Math.abs(year.start - newStart) : Math.abs(year.end - newEnd)

    timerFade.current && clearTimeout(timerFade.current)

    if (firstLoading.current == true) {
      firstLoading.current = false
    } else {
      setLoading(true)
      const changeSlide = async () => {
        setPrevActiveSlide(() => {
          return activeSlide
        })
      }
      timerFade.current = setTimeout(async () => {
        await changeSlide().then(() => {
          setLoading(false)
        })
      }, delay)
    }

    if (timer.current != null) {
      clearTimeout(timer.current);
    }

    const checkYear = (prev: number, next: number) => {
      if (prev < next) {
        return 1
      } else if (prev > next) {
        return -1
      }

      return 0
    }

    const animateStep = () => {
      setYear(prev => {
        const newYear = { ...prev }
        let repeat = false
        const checkStart = checkYear(newYear.start, newStart)
        const checkEnd = checkYear(newYear.end, newEnd)

        if (checkStart != 0) {
          newYear.start += checkStart;
          repeat = true
        }

        if (checkEnd != 0) {
          newYear.end += checkEnd;
          repeat = true
        }

        if (repeat == true) {
          timer.current = setTimeout(() => {
            animateStep()
          }, delay / stepDelay)
          prev = newYear
        }

        return newYear
      })
    }


    animateStep()

    return (() => {
      timer.current && clearTimeout(timer.current)
    })
  }, [activeSlide]);

  const handleNextSlide = () => {
    if (activeSlide + 1 < timelineSlides.length) {
      setActiveSlide((prev) => prev + 1)
    }
  }

  const handlePrevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1)
    }
  }

  return (
    <div className={styles.timelineSlider}>
      <div className={styles.timelineSliderWrapper}>
        {screenSize.width >= 768 && (
          <div className={styles.circularSliderWrapper}>
            <CircularDotsSlider
              slidesCount={timelineSlides.length}
              activeIndex={activeSlide}
              onDotClick={handleSetActiveSlideClick}
            />
          </div>
        )}
        <div className={styles.timelineSliderYears}>
          <span className={`${styles.timelineSliderYear} ${styles.timelineSliderYearStart}`}>{year.start}</span>
          <span className={`${styles.timelineSliderYear} ${styles.timelineSliderYearEnd}`}>{year.end}</span>
        </div>
        {screenSize.width >= 768 && (
          <div className={styles.timelineSliderNavigate}>
            <div className={styles.timelineSliderNavigateCoutns}>
              <span className={styles.timelineSliderNavigateCount}>{10 > activeSlide + 1 ? '0' + (activeSlide + 1) : activeSlide + 1}</span>/<span className={styles.timelineSliderNavigateCount}>{10 > timelineSlides.length ? '0' + timelineSlides.length : timelineSlides.length}</span>
            </div>
            <div className={styles.timelineSliderArrows}>
              <button onClick={() => handlePrevSlide()} className={`${styles.timelineSliderArrow} ${styles.timelineSliderPrev} ${activeSlide === 0 ? styles.disabled : ''}`} area-label='Предыдущий слайд'>
                <Arrow />
              </button>
              <button onClick={() => handleNextSlide()} className={`${styles.timelineSliderArrow} ${styles.timelineSliderNext} ${activeSlide === timelineSlides.length - 1 ? styles.disabled : ''}`} area-label='Следующий слайд'>
                <Arrow />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={`${styles.timelineSliderEvents} ${loading && styles.loading}`}>
        {prevActiveSlide >= 0 && timelineSlides[prevActiveSlide].events && (
          <>
            <Swiper
              modules={[Navigation, FreeMode]}
              spaceBetween={80}
              slidesPerView={3.4}
              freeMode={true}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setStart(swiper.isBeginning)
                setEnd(swiper.isEnd)
                swiper.slideTo(0)
              }}
              onSlideChange={(swiper) => {
                setStart(swiper.isBeginning)
                setEnd(swiper.isEnd)
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1.5,
                  spaceBetween: 25
                },
                1024: {
                  slidesPerView: 2,
                  spaceBetween: 30
                },
                1280: {
                  slidesPerView: 3.4,
                  spaceBetween: 40
                }
              }}
              className={styles.timelineSliderEventsContainer}
            >
              {timelineSlides[prevActiveSlide].events.map((event, eventIndex) => (
                <SwiperSlide key={eventIndex} className={styles.timelineSliderEventSlide}>
                  <div className={styles.timelineSliderEvent}>
                    <div className={styles.timelineSliderEventYear}>{event.year}</div>
                    <div className={styles.timelineSliderEventTitle}>{event.event}</div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

          </>
        )}
        {screenSize.width >= 768 && (
          <SwiperNavButtons start={start} end={end} swiperInstance={swiperRef.current} />
        )}
      </div>
        {screenSize.width < 768 && (
          <div className={styles.timelineSliderNavigate}>
            <div className={styles.timelineSliderNavigateContainer}>
              <div className={styles.timelineSliderNavigateCoutns}>
                <span className={styles.timelineSliderNavigateCount}>{10 > activeSlide + 1 ? '0' + (activeSlide + 1) : activeSlide + 1}</span>/<span className={styles.timelineSliderNavigateCount}>{10 > timelineSlides.length ? '0' + timelineSlides.length : timelineSlides.length}</span>
              </div>
              <div className={styles.timelineSliderArrows}>
                <button onClick={() => handlePrevSlide()} className={`${styles.timelineSliderArrow} ${styles.timelineSliderPrev} ${activeSlide === 0 ? styles.disabled : ''}`} area-label='Предыдущий слайд'>
                  <ArrowMobile />
                </button>
                <button onClick={() => handleNextSlide()} className={`${styles.timelineSliderArrow} ${styles.timelineSliderNext} ${activeSlide === timelineSlides.length - 1 ? styles.disabled : ''}`} area-label='Следующий слайд'>
                  <ArrowMobile />
                </button>
              </div>
            </div>
            <div className={styles.timelineSliderDots}>
              {timelineSlides.map((_, i) => (
                <button key={i} className={`${styles.timelineSliderDot} ${activeSlide == i ? styles.active : ''}`} onClick={() => handleSetActiveSlideClick(i)} area-label={'переход на слайд: ' + (i + 1)}></button>
              ))}
            </div>
          </div>
        )}
    </div >
  );
};