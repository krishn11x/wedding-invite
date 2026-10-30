import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const audioRef = useRef(null);
  const [showRsvp, setShowRsvp] = useState(false);
const [rsvpName, setRsvpName] = useState('');
const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
const [rsvpLoading, setRsvpLoading] = useState(false);

const RSVP_URL =
  'https://script.google.com/macros/s/AKfycbxqCQLjVpVuep31ah7QCeLB_78UO-PN_Ux91b_LUM7ur8zxMROdfK8OSY375KhRclaE2Q/exec';

const submitRSVP = async () => {
  const name = rsvpName.trim();

  if (!name) return;

  setRsvpLoading(true);

  try {
    await fetch(RSVP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        name: name
      })
    });

    setRsvpSubmitted(true);
  } catch (error) {
    console.error('RSVP submission error:', error);
  } finally {
    setRsvpLoading(false);
  }
};
  const canvasRef = useRef(null);

  // Exact assets from Phool Dwaar Reference
  const assets = {
    audio: "/tenu-leke-mai-javanaga.mp3",
    doorCover: "https://myindiaura.com/art/story/phool-dwaar/opening-poster.webp",
    videoBg: "https://myindiaura.com/art/story/phool-dwaar/hero-loop.mp4",
    frameArch: "https://myindiaura.com/art/story/phool-dwaar/frame-hero.webp",
    flowerSprig: "https://myindiaura.com/art/story/phool-dwaar/flower-sprig.webp",
    seal: "https://myindiaura.com/art/story/phool-dwaar/seal.webp",
    haldi: "https://myindiaura.com/art/story/phool-dwaar/event-haldi.webp",
    mehendi: "https://myindiaura.com/art/story/phool-dwaar/event-mehendi.webp",
    wedding: "https://myindiaura.com/art/story/phool-dwaar/event-wedding.webp",
    closingFrame: "https://myindiaura.com/art/story/phool-dwaar/frame-close.webp"
  };

  // Countdown Logic
  useEffect(() => {
    const targetDate = new Date('2026-11-26T19:00:00').getTime();
    const timer = setInterval(() => {
      const diff = targetDate - new Date().getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpen = () => {
    setIsOpened(true);
    if (audioRef.current && isMuted) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    }
  };
  // Lock page scrolling until the invitation is opened
useEffect(() => {
  document.body.style.overflow = isOpened ? 'auto' : 'hidden';

  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isOpened]);

  // Scratch to Reveal Canvas Logic
  useEffect(() => {
    if (!isOpened || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set proper dimensions based on container
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with rose magenta
    ctx.fillStyle = '#C53051';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Text Overlay on Canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 12px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('SWIPE THE PETALS AWAY', canvas.width / 2, canvas.height / 2 + 5);

    let isScratching = false;

    const getPos = (e) => {
      const bounds = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - bounds.left, y: clientY - bounds.top };
    };

    const start = (e) => { isScratching = true; scratch(e); };
    const stop = () => { isScratching = false; };
    const scratch = (e) => {
      if (!isScratching) return;
      const { x, y } = getPos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: true });
    canvas.addEventListener('touchmove', scratch, { passive: true });
    canvas.addEventListener('touchend', stop);

    return () => {
      // Cleanup handled automatically by React on unmount
    };
  }, [isOpened]);

  return (
    <div className="app-frame">
      <audio ref={audioRef} loop src={assets.audio} />

      {/* 1. CLOSED DOOR SCREEN */}
      <div className={`cover-screen ${isOpened ? 'opened' : ''}`} onClick={handleOpen}>
        <img src={assets.doorCover} alt="Closed Door" className="cover-image" />
        <button className="cover-btn font-cinzel">TAP TO OPEN YOUR INVITE</button>
      </div>

      {/* FLOATING NAVBAR */}
      {isOpened && (
        <div className="floating-nav">
          <button className="nav-btn primary" onClick={() => document.getElementById('rsvp').scrollIntoView({behavior: 'smooth'})}>
            RSVP
          </button>
          
          <button className="nav-btn" onClick={() => {
            audioRef.current[isMuted ? 'play' : 'pause']();
            setIsMuted(!isMuted);
          }}>
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          </button>
        </div>
      )}

      <div className="hero-section">

  {/* GANESH JI + MANTRA — TOP */}
  <div
    style={{
      position: 'absolute',
      top: '145px',
      left: '0',
      width: '100%',
      zIndex: 10,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}
  >
    <img
      src="/gannu-ji.png"
      alt="Ganesh Ji"
      style={{
        width: '55px',
        height: '55px',
        objectFit: 'contain',
        display: 'block',
        marginBottom: '5px'
      }}
    />

    <div
      className="font-hindi"
      style={{
        fontSize: '1.15rem',
        color: '#8B1E2D',
        margin: 0,
        lineHeight: '1.2'
      }}
    >
      || श्री गणेशाय नमः ||
    </div>
  </div>

  {/* HERO VIDEO */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="hero-video"
  >
    <source src={assets.videoBg} type="video/mp4" />
  </video>

  <img
    src={assets.frameArch}
    alt="Floral Arch"
    className="hero-frame-overlay"
  />

  {/* HERO CONTENT */}
  <div className="hero-content">

    <p
      style={{
        letterSpacing: '2px',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        marginBottom: '40px',
        marginLeft: '30px',
        fontWeight: 600
        
    
      }}
    >
      A CELEBRATION OF LOVE
    </p>

    <h1 className="font-script">
      Aanchal
    </h1>

    <p
      className="font-cinzel"
      style={{
        color: '#471111',
        letterSpacing: '4px',
        margin: '5px 0'
      }}
    >
      WEDS
    </p>

    <h1 className="font-script">
      Harshit
    </h1>

  </div>

</div>

      {/* 3. INVITATION LETTER */}
      <div className="content-section">
        {/* WEDDING MANTRA */}
<div
  style={{
    width: 'calc(100% - 36px)',
    maxWidth: '450px',
    margin: '0 auto 24px',
    padding: '16px 14px',
    border: '1.5px solid #C5A059',
    borderRadius: '18px',
    background: '#FFFDF9',
    boxSizing: 'border-box',
    textAlign: 'center',
    boxShadow: '0 3px 12px rgba(44,24,16,0.06)'
  }}
>
 <p
  style={{
    fontFamily: "'Noto Serif Devanagari', serif",
    fontSize: '1rem',
    color: '#8B1E2D',
    lineHeight: 1.9,
    margin: 0,
    fontWeight: '400',
    letterSpacing: '0.1px'
  }}
>
  सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके ।<br />
  शरण्ये त्र्यम्बके गौरि नारायणी नमोऽस्तु ते ॥
</p>
</div>
  <div className="invite-card">

    <h2
      className="font-script"
      style={{
        fontSize: '2.5rem',
        color: '#8B1E2D',
        margin: 0
      }}
    >
      You're Cordially Invited    By
    </h2>

    <img
  src={assets.flowerSprig}
  alt="Flower"
  style={{ width: '40px', margin: '15px 0 8px' }}
/>

{/* WEDDING MANTRA */}


<div
  className="font-body"
      style={{
        fontSize: '0.78rem',
        color: '#6D5A50',
        lineHeight: 1.7,
        marginBottom: '18px'
      }}
    >

      <p style={{ margin: '8px 0' }}>
        <b>Grandson of</b><br />
        Shri Ishwar Chand Tayal & Smt Urmila Devi
      </p>

      <p style={{ margin: '8px 0' }}>
        <b>Son of</b><br />
        Shri Naveen Aggarwal & Smt Uma Aggarwal
      </p>

      <div
        style={{
          width: '50px',
          height: '1px',
          background: '#C5A059',
          margin: '14px auto'
        }}
      />

      <p style={{ margin: '8px 0' }}>
        <b>Granddaughter of</b><br />
        Late Shri RadheyShyam Gupta & Late Smt Ram Kali Devi
      </p>

      <p style={{ margin: '8px 0' }}>
        <b>Daughter of</b><br />
        Shri Anup Gupta & Late Smt Chhavi Gupta
      </p>

    </div>

    <p
      className="font-body"
      style={{
        fontSize: '0.85rem',
        color: '#6D5A50',
        lineHeight: 1.6,
        margin: '15px 0 5px'
      }}
    >
      With love,
    </p>

    <p
      className="font-script"
      style={{
        fontSize: '1.8rem',
        color: '#8B1E2D',
        margin: '0 0 8px'
      }}
    >
      Aanchal & Harshit
    </p>

    <p
      className="font-body"
      style={{
        fontSize: '0.85rem',
        color: '#6D5A50',
        lineHeight: 1.6,
        margin: 0
      }}
    >
      together with their families, invite you to celebrate
      with them as they begin their beautiful journey
      of love, laughter and togetherness.
    </p>

    <img
      src={assets.seal}
      alt="A&H Wax Seal"
      className="seal-img"
    />

  </div>
</div>

      {/* 4. SAVE THE DATE (SCRATCH) */}
      <div className="content-section" style={{ paddingTop: 0 }}>
        <h2 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#3B060E', marginBottom: '15px' }}>Save the date</h2>
        
        <div className="scratch-container">
          <div style={{ zIndex: 1 }}>
            <h3 className="font-script" style={{ fontSize: '2.4rem', color: '#8B1E2D', margin: 0 }}>26 November 2026</h3>
            <p className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '2px', color: '#C5A059', margin: '5px 0' }}>THURSDAY • EVENING</p>
          </div>
          <canvas ref={canvasRef} className="scratch-canvas"></canvas>
        </div>
      </div>

      {/* 5. COUNTDOWN */}
      <div className="content-section" style={{ background: '#FAF2E6', borderTop: '1px solid #E8D3A7' }}>
        <h2 className="font-script" style={{ fontSize: '2.4rem', color: '#8B1E2D', marginBottom: '15px' }}>Counting down</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} style={{ background: '#FFF', border: '1px solid #C5A059', borderRadius: '30px 30px 10px 10px', padding: '15px 5px', width: '70px' }}>
              <div className="font-cinzel" style={{ fontSize: '1.4rem', color: '#8B1E2D', fontWeight: 'bold' }}>{value}</div>
              <div style={{ fontSize: '0.6rem', color: '#6D5A50', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. CELEBRATIONS */}
      <div className="content-section">
        <h2 className="font-script" style={{ fontSize: '2.6rem', color: '#8B1E2D', marginBottom: '20px' }}>The celebrations</h2>
        
        <div className="event-card">
          <img src={assets.haldi} alt="Haldi" />
          <div>
            <span style={{ fontSize: '0.65rem', color: '#8B1E2D', fontWeight: 'bold', letterSpacing: '1px' }}>UP NEXT</span>
            <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#3B060E', margin: '2px 0 5px' }}>Haldi</h3>
            <p style={{ fontSize: '0.8rem', color: '#6D5A50', margin: 0 }}>Wed, 25 Nov • Morning</p>
            <p style={{ fontSize: '0.8rem', color: '#6D5A50', margin: '0 0 5px 0' }}>Ankur Apartment, Rajendra Nagar, Sahibabad</p>
            <span style={{ fontSize: '0.7rem', color: '#C5A059' }}><i className="fa-solid fa-shirt"></i> Yellow tones</span>
          </div>
        </div>

        <div className="event-card">
          <img src={assets.mehendi} alt="Mehendi" />
          <div>
            <span style={{ fontSize: '0.65rem', color: '#8B1E2D', fontWeight: 'bold', letterSpacing: '1px' }}>CEREMONY</span>
            <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#3B060E', margin: '2px 0 5px' }}>Mehendi</h3>
            <p style={{ fontSize: '0.8rem', color: '#6D5A50', margin: 0 }}>Wed, 25 Nov • Evening</p>
            <p style={{ fontSize: '0.8rem', color: '#6D5A50', margin: '0 0 5px 0' }}>Ankur Apartment, Rajendra Nagar, Sahibabad</p>
            <span style={{ fontSize: '0.7rem', color: '#C5A059' }}><i className="fa-solid fa-shirt"></i> Greens & Florals</span>
          </div>
        </div>

        <div className="event-card" style={{ border: '2px solid #C5A059' }}>
          <img src={assets.wedding} alt="Wedding" />
          <div>
            <span style={{ fontSize: '0.65rem', color: '#C5A059', fontWeight: 'bold', letterSpacing: '1px' }}>MAIN EVENT</span>
            <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#3B060E', margin: '2px 0 5px' }}>Wedding Pheras</h3>
            <p style={{ fontSize: '0.8rem', color: '#6D5A50', margin: 0 }}>Thu, 26 Nov • Evening</p>
            <p style={{ fontSize: '0.8rem', color: '#6D5A50', margin: '0 0 5px 0' }}>Royal Pepper, Peeragarhi</p>
            <span style={{ fontSize: '0.7rem', color: '#8B1E2D' }}><i className="fa-solid fa-shirt"></i> Ethnic Glam</span>
          </div>
        </div>
      </div>

      {/* 7. VENUE & GENUINE QR */}
      <div
  className="content-section"
  style={{
    background: '#FFFDF9',
    paddingBottom: '35px'
  }}
>
        <h2
  className="font-script"
  style={{
    fontSize: '2.6rem',
    color: '#8B1E2D',
    margin: 0
  }}
>
  The venue
</h2>

<div
  style={{
    width: '42px',
    height: '1px',
    background: '#C5A059',
    margin: '8px auto 5px'
  }}
></div>

<h4
  className="font-cinzel"
  style={{
    fontSize: '1rem',
    color: '#3B060E',
    margin: '5px 0 12px',
    letterSpacing: '0.5px'
  }}
>
  Royal Pepper, Peeragarhi
</h4>
        
        <iframe title="Map" width="100%" height="180" style={{ border: '1px solid #E8D3A7', borderRadius: '12px', margin: '15px 0' }} src="https://maps.google.com/maps?q=28.6798,77.0920&hl=en&z=15&output=embed" allowFullScreen></iframe>
        
        
{/* VENUE ACTION BUTTONS */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '18px',
    width: '100%',
    marginTop: '12px',
    paddingLeft: '8px',
    paddingRight: '8px',
    boxSizing: 'border-box',
    flexWrap: 'nowrap'
  }}
>
  {/* DIRECTIONS */}
<button
  type="button"
  aria-label="Directions"
  title="Directions"
  onClick={() => {
    window.open(
      'https://www.google.com/maps/dir/28.6813721,77.3515763/Royal+Pepper+Banquet+hall+-+Peeragarhi,+E-1,+Delhi+-+Peeragarhi+metro,+Udyog+Nagar,+Industrial+Area,+New+Delhi,+Delhi+110041/@28.7001225,77.1364175,12z/data=!4m9!4m8!1m1!4e1!1m5!1m1!1s0x390d05f31096e27b:0x3e613405ec2f17f5!2m2!1d77.0937182!2d28.6800073?entry=ttu',
      '_blank',
      'noopener,noreferrer'
    );
  }}
 style={{
  height: '40px',
  padding: '0 15px',
  borderRadius: '20px',
  border: '1px solid #C5A059',
  background: '#8B1E2D',
  color: '#FFFDF9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  cursor: 'pointer',
  boxShadow: '0 3px 10px rgba(139,30,45,0.16)',
  whiteSpace: 'nowrap',
  fontFamily: 'Cinzel, serif',
  fontSize: '0.68rem',
  fontWeight: '600',
  letterSpacing: '1px',
  textTransform: 'uppercase'
}}
>
  <i className="fa-solid fa-location-arrow"></i>
  Directions
</button>

{/* UBER */}
<button
  onClick={() => {
    const uberUrl =
      'uber://riderequest' +
      '?pickup=my_location' +
      '&dropoff[latitude]=28.6798' +
      '&dropoff[longitude]=77.0920' +
      '&dropoff[nickname]=Royal%20Pepper' +
      '&dropoff[formatted_address]=Royal%20Pepper%2C%20Peeragarhi%2C%20Delhi';

    window.open(uberUrl, '_blank');

    setTimeout(() => {
      window.open(
        'https://m.uber.com/looking',
        '_blank',
        'noopener,noreferrer'
      );
    }, 1200);
  }}
  aria-label="Uber"
  style={{
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderRadius: '50%',
    border: '1px solid #C5A059',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(44,24,16,0.15)',
    overflow: 'hidden'
  }}
>
  <img
    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/uber.svg"
    alt="Uber"
    style={{
      width: '27px',
      height: '27px',
      objectFit: 'contain',
      filter: 'invert(1)',
      display: 'block'
    }}
  />
</button>

 {/* OLA */}
<button
  onClick={() => {
    const olaUrl =
      'olacabs://app/launch' +
      '?drop_lat=28.6798' +
      '&drop_lng=77.0920' +
      '&drop_address=' +
      encodeURIComponent('Royal Pepper, Peeragarhi, Delhi') +
      '&landing_page=bk';

    window.location.href = olaUrl;

    setTimeout(() => {
      window.open(
        'https://book.olacabs.com/',
        '_blank',
        'noopener,noreferrer'
      );
    }, 1200);
  }}
  aria-label="Ola"
  style={{
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderRadius: '50%',
    border: '1px solid #C5A059',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(44,24,16,0.15)',
    overflow: 'hidden'
  }}
>
  <img
    src="/ola-logo.png"
    alt="Ola"
    style={{
      width: '40px',
      height: '40px',
      objectFit: 'contain',
      display: 'block',
      borderRadius: '50%'
    }}
  />
</button>

  {/* RAPIDO */}
  <button
    type="button"
    aria-label="Open Rapido"
    title="Rapido"
    onClick={() => {
      const rapidoUrl =
        'https://www.rapido.bike/Home' +
        '?drop_lat=28.6798' +
        '&drop_lng=77.0920' +
        '&drop_address=' +
        encodeURIComponent('Royal Pepper, Peeragarhi, Delhi');

      window.open(
        rapidoUrl,
        '_blank',
        'noopener,noreferrer'
      );
    }}
    style={{
      width: '40px',
      height: '40px',
      minWidth: '40px',
      padding: 0,
      borderRadius: '50%',
      border: '1px solid #D8C8B8',
      background: '#FFFDF9',
      color: '#2C1810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 3px 10px rgba(44,24,16,0.08)',
      transition: 'all 0.2s ease'
    }}
  >
   
    <img
    src="/rapido.png"
    alt="Rapido"
    style={{
      width: '40px',
      height: '40px',
      objectFit: 'contain',
      display: 'block',
      borderRadius: '50%'
    }}
  />
  </button>
</div>

        <div
  style={{
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}
>
  <div
    style={{
      background: '#FFF',
      border: '1px solid #C5A059',
      padding: '7px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(44,24,16,0.08)'
    }}
  >
    <img
      src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://www.google.com/maps/dir/28.6813721,77.3515763/Royal+Pepper+Banquet+hall+-+Peeragarhi,+E-1,+Delhi+-+Peeragarhi+metro,+Udyog+Nagar,+Industrial+Area,+New+Delhi,+Delhi+110041/@28.7001225,77.1364175,12z/data=!4m9!4m8!1m1!4e1!1m5!1m1!1s0x390d05f31096e27b:0x3e613405ec2f17f5!2m2!1d77.0937182!2d28.6800073?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"
      alt="QR"
      style={{
        width: '115px',
        height: '115px',
        display: 'block'
      }}
    />
  </div>

  <div
    style={{
      fontSize: '0.65rem',
      color: '#8B1E2D',
      fontWeight: '600',
      letterSpacing: '1.5px',
      marginTop: '8px'
    }}
  >
             SCAN FOR VENUE
        </div>
      </div>
    </div>
    
    {/* WELL WISHERS / RISHTEDAAR BOX */}
<div
 
>
  

  {/* ================= WELL WISHERS + CORDIALLY INVITED ================= */}
<div
  style={{
    width: 'calc(100% - 28px)',
    maxWidth: '520px',
    margin: '18px auto 32px',
    padding: '26px 18px 24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',

    background: `
      radial-gradient(circle at 8% 12%, rgba(226,168,168,0.20) 0, rgba(226,168,168,0.10) 12%, transparent 27%),
      radial-gradient(circle at 92% 18%, rgba(203,174,105,0.18) 0, rgba(203,174,105,0.08) 13%, transparent 28%),
      radial-gradient(circle at 12% 88%, rgba(218,157,157,0.15) 0, rgba(218,157,157,0.06) 12%, transparent 27%),
      radial-gradient(circle at 88% 86%, rgba(190,157,99,0.15) 0, rgba(190,157,99,0.06) 13%, transparent 28%),
      radial-gradient(circle at 50% 45%, rgba(255,255,255,0.90), transparent 55%),
      linear-gradient(135deg, #FFF8EF 0%, #FFFDF9 48%, #FFF6EC 100%)
    `,

    border: '1px solid #C5A059',
    borderRadius: '24px',
    boxShadow: '0 8px 28px rgba(44,24,16,0.09)'
  }}
>
  {/* CORNER ORNAMENTS */}
  <div
    style={{
      position: 'absolute',
      top: '8px',
      left: '12px',
      color: '#B18435',
      fontSize: '21px',
      opacity: 0.65,
      transform: 'rotate(-18deg)'
    }}
  >
    ❧
  </div>

  <div
    style={{
      position: 'absolute',
      top: '8px',
      right: '12px',
      color: '#B18435',
      fontSize: '21px',
      opacity: 0.65,
      transform: 'scaleX(-1) rotate(-18deg)'
    }}
  >
    ❧
  </div>

  <div
    style={{
      position: 'absolute',
      bottom: '8px',
      left: '12px',
      color: '#B18435',
      fontSize: '21px',
      opacity: 0.65,
      transform: 'scaleY(-1) rotate(-18deg)'
    }}
  >
    ❧
  </div>

  <div
    style={{
      position: 'absolute',
      bottom: '8px',
      right: '12px',
      color: '#B18435',
      fontSize: '21px',
      opacity: 0.65,
      transform: 'scale(-1) rotate(-18deg)'
    }}
  >
    ❧
  </div>

  {/* ================= HEADING ================= */}
  <div
    style={{
      textAlign: 'center',
      fontFamily: "'Cinzel', serif",
      color: '#8B1E2D',
      fontSize: '0.82rem',
      letterSpacing: '2.8px',
      fontWeight: 500,
      lineHeight: 1.6,
      marginBottom: '12px'
    }}
  >
    WITH UTMOST GRATITUDE
    <br />
    AND BLESSINGS
  </div>

  {/* TOP ORNAMENT */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '20px'
    }}
  >
    <div
      style={{
        width: '60px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #C5A059)'
      }}
    />

    <span
      style={{
        color: '#A51F35',
        fontSize: '12px'
      }}
    >
      ❧ ✦ ❧
    </span>

    <div
      style={{
        width: '60px',
        height: '1px',
        background: 'linear-gradient(to left, transparent, #C5A059)'
      }}
    />
  </div>


  {/* ================= TWO MATCHING COLUMNS ================= */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    columnGap: '20px',
    alignItems: 'start',
    width: '100%'
  }}
>
  {/* ================= LEFT: WELL WISHERS ================= */}
  <div
    style={{
      width: '100%',
      textAlign: 'center',
      minWidth: 0
    }}
  >
    <div
      style={{
        fontFamily: "'Great Vibes', cursive",
        color: '#A66A20',
        fontSize: '1.45rem',
        lineHeight: '1',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap'
      }}
    >
      Well Wishers
    </div>

    {/* Heading underline */}
    <div
      style={{
        width: '100%',
        height: '1px',
        background: '#C5A059',
        margin: '10px auto 18px',
        position: 'relative'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#FFF9F1',
          padding: '0 6px',
          color: '#A51F35',
          fontSize: '8px'
        }}
      >
        ❧
      </span>
    </div>

    {/* Name 1 */}
    <div
      style={{
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#8B1E2D',
        fontSize: '1.18rem',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}
    >
      Amar Gupta
    </div>

    {/* Small ornament */}
    <div
      style={{
        height: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#B18435',
        fontSize: '8px'
      }}
    >
      ✦
    </div>

    {/* Name 2 */}
    <div
      style={{
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#8B1E2D',
        fontSize: '1.18rem',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}
    >
      Krishna Gupta
    </div>
  </div>


  {/* ================= CENTER DIVIDER ================= */}
  <div
    style={{
      width: '1px',
      height: '150px',
      background:
        'linear-gradient(to bottom, transparent, #C5A059 10%, #C5A059 90%, transparent)',
      position: 'relative'
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#FFF9F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#B18435',
        fontSize: '12px'
      }}
    >
      ✦
    </div>
  </div>


  {/* ================= RIGHT: CORDIALLY INVITED ================= */}
  <div
    style={{
      width: '100%',
      textAlign: 'center',
      minWidth: 0
    }}
  >
    <div
      style={{
        fontFamily: "'Great Vibes', cursive",
        color: '#A66A20',
        fontSize: '1.45rem',
        lineHeight: '1',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap'
      }}
    >
      Cordially Invited by
    </div>

    {/* Heading underline */}
    <div
      style={{
        width: '100%',
        height: '1px',
        background: '#C5A059',
        margin: '10px auto 18px',
        position: 'relative'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#FFF9F1',
          padding: '0 6px',
          color: '#A51F35',
          fontSize: '8px'
        }}
      >
        ❧
      </span>
    </div>

    {/* Name 1 */}
    <div
      style={{
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#8B1E2D',
        fontSize: '1.18rem',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}
    >
      Sh. Manoj Gupta
    </div>

    {/* Small ornament */}
    <div
      style={{
        height: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#B18435',
        fontSize: '8px'
      }}
    >
      ✦
    </div>

    {/* Name 2 */}
    <div
      style={{
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#8B1E2D',
        fontSize: '1.18rem',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}
    >
      Sh. Anup Gupta
    </div>
  </div>
</div>


  {/* ================= BOTTOM ORNAMENT ================= */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '20px'
    }}
  >
    <div
      style={{
        width: '65px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #C5A059)'
      }}
    />

    <span
      style={{
        color: '#A51F35',
        fontSize: '12px'
      }}
    >
      ❧ ✦ ❧
    </span>

    <div
      style={{
        width: '65px',
        height: '1px',
        background: 'linear-gradient(to left, transparent, #C5A059)'
      }}
    />
  </div>
</div>
</div>

{/* ================= LITTLE STARS BOX ================= */}
<div
  style={{
    width: 'calc(100% - 28px)',
    maxWidth: '560px',
    margin: '8px auto 28px',
    padding: '18px 12px 15px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',

    background: `
      radial-gradient(circle at 4% 50%, rgba(218,157,157,0.20), transparent 24%),
      radial-gradient(circle at 96% 50%, rgba(203,174,105,0.17), transparent 24%),
      radial-gradient(circle at 18% 15%, rgba(240,190,190,0.12), transparent 20%),
      radial-gradient(circle at 82% 85%, rgba(210,180,110,0.10), transparent 20%),
      linear-gradient(135deg, #FFF7ED 0%, #FFFDF9 48%, #FFF6EC 100%)
    `,

    border: '1px solid #C5A059',
    borderRadius: '18px',
    boxShadow: '0 6px 20px rgba(44,24,16,0.07)'
  }}
>
  {/* ================= CORNER ORNAMENTS ================= */}

  <div
    style={{
      position: 'absolute',
      top: '3px',
      left: '5px',
      color: '#C5A059',
      fontSize: '27px',
      opacity: 0.75,
      transform: 'rotate(-12deg)'
    }}
  >
    ❧
  </div>

  <div
    style={{
      position: 'absolute',
      top: '3px',
      right: '5px',
      color: '#C5A059',
      fontSize: '27px',
      opacity: 0.75,
      transform: 'scaleX(-1) rotate(-12deg)'
    }}
  >
    ❧
  </div>

  <div
    style={{
      position: 'absolute',
      bottom: '3px',
      left: '5px',
      color: '#C5A059',
      fontSize: '27px',
      opacity: 0.75,
      transform: 'scaleY(-1) rotate(-12deg)'
    }}
  >
    ❧
  </div>

  <div
    style={{
      position: 'absolute',
      bottom: '3px',
      right: '5px',
      color: '#C5A059',
      fontSize: '27px',
      opacity: 0.75,
      transform: 'scale(-1) rotate(-12deg)'
    }}
  >
    ❧
  </div>


  {/* ================= TOP ORNAMENT ================= */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      marginBottom: '8px'
    }}
  >
    <div
      style={{
        flex: 1,
        maxWidth: '125px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #C5A059)'
      }}
    />

    <span
      style={{
        color: '#A66A20',
        fontSize: '13px'
      }}
    >
      ✦
    </span>

    <div
      style={{
        flex: 1,
        maxWidth: '125px',
        height: '1px',
        background: 'linear-gradient(to left, transparent, #C5A059)'
      }}
    />
  </div>


  {/* ================= TITLE ================= */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '12px',
      textAlign: 'center'
    }}
  >
    <span
      style={{
        color: '#A51F35',
        fontSize: '1.45rem',
        lineHeight: 1
      }}
    >
      ♥
    </span>

    <div
      style={{
        fontFamily: "'Great Vibes', cursive",
        color: '#9B1E35',
        fontSize: '1.42rem',
        lineHeight: 1.1,
        whiteSpace: 'nowrap'
      }}
    >
      Our little stars are also excited to celebrate with you!
    </div>

    <span
      style={{
        color: '#A51F35',
        fontSize: '1.45rem',
        lineHeight: 1
      }}
    >
      ♥
    </span>
  </div>


  {/* ================= SCROLLABLE LITTLE STARS NAMES ================= */}
<div
  className="little-stars-scroll"
  style={{
    width: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
    overscrollBehaviorX: 'contain',
    touchAction: 'pan-x',
    cursor: 'grab',
    padding: '4px 0 8px',
    boxSizing: 'border-box',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      width: 'max-content',
      minWidth: '100%',
      justifyContent: 'flex-start',
      whiteSpace: 'nowrap',
      padding: '0 12px',
      boxSizing: 'border-box'
    }}
  >
    {[
      'Rudransh',
      'Yuvaan',
      'Shrey',
      'Aarav',
      'Krishiv',
      'Advit',
      'Bhavya',
      'Ridhaan',
      'Shivay'
    ].map((name, index) => (
      <React.Fragment key={name}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: '#8B1E2D',
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {name}
        </span>

        {index < 8 && (
          <span
            style={{
              color: '#B18435',
              fontSize: '0.7rem',
              margin: '0 9px',
              flexShrink: 0
            }}
          >
            ✦
          </span>
        )}
      </React.Fragment>
    ))}
  </div>
</div>


  {/* ================= BOTTOM ORNAMENT ================= */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      marginTop: '9px'
    }}
  >
    <div
      style={{
        flex: 1,
        maxWidth: '125px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #C5A059)'
      }}
    />

    <span
      style={{
        color: '#A66A20',
        fontSize: '13px'
      }}
    >
      ✦
    </span>

    <div
      style={{
        flex: 1,
        maxWidth: '125px',
        height: '1px',
        background: 'linear-gradient(to left, transparent, #C5A059)'
      }}
    />
  </div>
</div>
    {/* 8. RSVP & CLOSING */}
    <div className="content-section" id="rsvp">
      <h2
        className="font-script"
        style={{
          fontSize: '2.6rem',
          color: '#8B1E2D',
          margin: 0
        }}
      >
        Will you join us?
      </h2>

      <p
        style={{
          fontSize: '0.85rem',
          color: '#6D5A50',
          margin: '10px 0 20px'
        }}
      >
        Your reply means the world to us
      </p>

      <button
        className="btn-solid"
        type="button"
        onClick={() => {
          setRsvpName('');
          setRsvpSubmitted(false);
          setShowRsvp(true);
        }}
      >
        TAP TO REPLY
      </button>
    </div>

    {/* CLOSING SECTION */}
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '30px',
        background: '#FDF9F1'
      }}
    >
      <img
        src={assets.closingFrame}
        alt="Closing Arch"
        style={{
          width: '100%',
          display: 'block'
        }}
      />

      <div
        style={{
          textAlign: 'center',
          position: 'absolute',
          top: '35%',
          width: '100%'
        }}
      >
        <h2
          className="font-script"
          style={{
            fontSize: '2.8rem',
            color: '#8B1E2D',
            margin: 0
          }}
        >
          Thank you
        </h2>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#2C1810'
          }}
        >
          for being part of our story.
        </p>

        <p
          className="font-script"
          style={{
            fontSize: '2.2rem',
            color: '#3B060E',
            marginTop: '10px'
          }}
        >
          Aanchal & Harshit
        </p>
      </div>
    </div>

    {/* RSVP POPUP */}
    {showRsvp && (
      <div
        onClick={() => setShowRsvp(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44, 24, 16, 0.58)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          zIndex: 99999
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '380px',
            background: '#FFFDF9',
            borderRadius: '22px',
            padding: '32px 25px 28px',
            boxSizing: 'border-box',
            textAlign: 'center',
            border: '1px solid #C5A059',
            boxShadow: '0 20px 60px rgba(44,24,16,0.28)',
            position: 'relative'
          }}
        >

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => setShowRsvp(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '14px',
              width: '30px',
              height: '30px',
              border: 'none',
              background: 'transparent',
              color: '#8B1E2D',
              fontSize: '25px',
              lineHeight: 1,
              cursor: 'pointer'
            }}
          >
            ×
          </button>

          {!rsvpSubmitted ? (
            <>
              {/* RSVP HEADING */}
              <h2
                className="font-script"
                style={{
                  fontSize: '2.5rem',
                  color: '#8B1E2D',
                  margin: '0 0 7px'
                }}
              >
                We'd love to know!
              </h2>

              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#6D5A50',
                  lineHeight: 1.6,
                  margin: '0 0 23px'
                }}
              >
                Just tell us your name and join us in the celebration ❤️
              </p>

              {/* NAME INPUT */}
              <input
                type="text"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submitRSVP();
                  }
                }}
                placeholder="Enter your name"
                autoFocus
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 17px',
                  boxSizing: 'border-box',
                  borderRadius: '25px',
                  border: '1px solid #D8C8B8',
                  background: '#FFFFFF',
                  color: '#2C1810',
                  outline: 'none',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.82rem',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}
              />

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                disabled={!rsvpName.trim() || rsvpLoading}
                onClick={submitRSVP}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '25px',
                  border: '1px solid #C5A059',
                  background: '#A91F35',
                  color: '#FFFDF9',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  letterSpacing: '1.2px',
                  cursor:
                    !rsvpName.trim() || rsvpLoading
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    !rsvpName.trim() || rsvpLoading ? 0.6 : 1,
                  boxShadow: '0 5px 15px rgba(139,30,45,0.18)'
                }}
              >
                {rsvpLoading ? 'SENDING...' : 'SUBMIT'}
              </button>
            </>
          ) : (
            <>
              {/* SUCCESS MESSAGE */}
              <div
                style={{
                  fontSize: '3rem',
                  marginBottom: '3px'
                }}
              >
                🎉
              </div>

              <h2
                className="font-script"
                style={{
                  fontSize: '3rem',
                  color: '#8B1E2D',
                  margin: '0 0 5px'
                }}
              >
                Hurray!
              </h2>

              <p
                style={{
                  fontSize: '0.88rem',
                  color: '#6D5A50',
                  lineHeight: 1.7,
                  margin: '0 0 22px'
                }}
              >
                Thank you, {rsvpName}! ❤️
                <br />
                We can't wait to celebrate with you.
              </p>

              <button
                type="button"
                onClick={() => setShowRsvp(false)}
                style={{
                  width: '100%',
                  height: '45px',
                  borderRadius: '24px',
                  border: '1px solid #C5A059',
                  background: '#8B1E2D',
                  color: '#FFFDF9',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </>
          )}

        </div>
      </div>
    )}

  </div>
);
}