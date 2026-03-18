(function () {
        const canvas = document.getElementById("mycelium-canvas");
        const ctx = canvas.getContext("2d");
        const core = document.getElementById("cursorCore");
        let W, H;
        function resize() {
          W = canvas.width = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);
        let mx = 0,
          my = 0,
          pmx = 0,
          pmy = 0,
          threads = [],
          segments = [];
        class Thread {
          constructor(x, y, angle, life) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.speed = 1.8 + Math.random() * 1.2;
            this.life = life || 28 + Math.random() * 18;
            this.age = 0;
            this.width = 0.5 + Math.random() * 0.8;
            this.children = 0;
            this.maxChildren = Math.random() < 0.35 ? 1 : 0;
            this.wobble = (Math.random() - 0.5) * 0.08;
          }
          update() {
            this.age++;
            this.angle += this.wobble + (Math.random() - 0.5) * 0.11;
            const nx = this.x + Math.cos(this.angle) * this.speed;
            const ny = this.y + Math.sin(this.angle) * this.speed;
            segments.push({
              x1: this.x,
              y1: this.y,
              x2: nx,
              y2: ny,
              alpha: 0.55,
              width: this.width,
              born: Date.now(),
            });
            this.x = nx;
            this.y = ny;
            if (
              this.age % 14 === 0 &&
              this.children < this.maxChildren &&
              Math.random() < 0.6
            ) {
              this.children++;
              threads.push(
                new Thread(
                  this.x,
                  this.y,
                  this.angle +
                    (Math.random() < 0.5 ? 1 : -1) *
                      (0.4 + Math.random() * 0.5),
                  this.life * 0.55,
                ),
              );
            }
            return this.age < this.life;
          }
        }
        let lastSpawn = 0;
        document.addEventListener("mousemove", (e) => {
          mx = e.clientX;
          my = e.clientY;
          core.style.left = mx + "px";
          core.style.top = my + "px";
          const now = Date.now(),
            dx = mx - pmx,
            dy = my - pmy,
            spd = Math.sqrt(dx * dx + dy * dy);
          if (spd > 3 && now - lastSpawn > 18) {
            lastSpawn = now;
            const angle = Math.atan2(dy, dx),
              count = spd > 12 ? 2 : 1;
            for (let i = 0; i < count; i++)
              threads.push(
                new Thread(mx, my, angle + (Math.random() - 0.5) * 1.2),
              );
          }
          pmx = mx;
          pmy = my;
        });
        document.addEventListener("mousedown", () => {
          core.classList.add("clicking");
          for (let i = 0; i < 8; i++)
            threads.push(
              new Thread(
                mx,
                my,
                ((Math.PI * 2) / 8) * i,
                20 + Math.random() * 10,
              ),
            );
        });
        document.addEventListener("mouseup", () =>
          core.classList.remove("clicking"),
        );
        document
          .querySelectorAll(
            "a,button,.feat-card,.p-card,.how-step,.prob-card,.impact-card",
          )
          .forEach((el) => {
            el.addEventListener("mouseenter", () =>
              core.classList.add("hovering"),
            );
            el.addEventListener("mouseleave", () =>
              core.classList.remove("hovering"),
            );
          });
        const FADE = 1400;
        function draw() {
          ctx.clearRect(0, 0, W, H);
          const now = Date.now();
          threads = threads.filter((t) => t.update());
          segments = segments.filter((s) => {
            const age = now - s.born,
              alpha = s.alpha * (1 - age / FADE);
            if (alpha <= 0.002) return false;
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
            ctx.strokeStyle = `rgba(196,116,44,${alpha})`;
            ctx.lineWidth = s.width;
            ctx.lineCap = "round";
            ctx.stroke();
            return true;
          });
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, 22);
          g.addColorStop(0, "rgba(224,146,72,0.12)");
          g.addColorStop(1, "rgba(224,146,72,0)");
          ctx.beginPath();
          ctx.arc(mx, my, 22, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          requestAnimationFrame(draw);
        }
        draw();
      })();

      // ── SCROLL + NAV ─────────────────────────────────────────
      const swf = document.getElementById("swFill");
      const nav = document.getElementById("nav");
      window.addEventListener("scroll", () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        swf.style.transform = `scaleX(${window.scrollY / h})`;
        nav.classList.toggle("scrolled", window.scrollY > 30);
      });

      // ── REVEAL ───────────────────────────────────────────────
      const ro = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("on");
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
      );
      document
        .querySelectorAll(".rev,.rev-l,.rev-r")
        .forEach((el) => ro.observe(el));

      // ── PROGRESS BARS ────────────────────────────────────────
      const bo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting)
              e.target
                .querySelectorAll(".panel-bar-fill,.prog-fill")
                .forEach((b) => b.classList.add("run", "go"));
          });
        },
        { threshold: 0.2 },
      );
      document
        .querySelectorAll(".hero-panel,.dash-shell")
        .forEach((el) => bo.observe(el));

      // ── QUOTE CAROUSEL ───────────────────────────────────────
      const slides = document.querySelectorAll(".q-slide");
      const qNav = document.getElementById("qNav");
      let qCur = 0,
        qT;
      slides.forEach((_, i) => {
        const d = document.createElement("button");
        d.className = "q-dot" + (i === 0 ? " on" : "");
        d.onclick = () => goQ(i);
        qNav.appendChild(d);
      });
      function goQ(n) {
        slides[qCur].classList.remove("active");
        qNav.children[qCur].classList.remove("on");
        qCur = n;
        slides[qCur].classList.add("active");
        qNav.children[qCur].classList.add("on");
        clearInterval(qT);
        qT = setInterval(() => goQ((qCur + 1) % slides.length), 5000);
      }
      qT = setInterval(() => goQ((qCur + 1) % slides.length), 5000);

      // ── MODAL ────────────────────────────────────────────────
      function openModal() {
        document.getElementById("modalOverlay").classList.add("open");
        document.body.style.overflow = "hidden";
      }
      function closeModal() {
        document.getElementById("modalOverlay").classList.remove("open");
        document.body.style.overflow = "";
        // reset after close animation
        setTimeout(() => {
          document.getElementById("modalSuccess").classList.remove("show");
          document.getElementById("modalHeader").classList.remove("hide");
          document.getElementById("modalBody").classList.remove("hide");
          document.getElementById("submitBtnText").textContent =
            "Secure My Early Access — It's Free →";
        }, 400);
      }
      function handleOverlayClick(e) {
        if (e.target === document.getElementById("modalOverlay")) closeModal();
      }
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });

      function submitForm() {
        const name = document.getElementById("f-name").value.trim();
        const company = document.getElementById("f-company").value.trim();
        const email = document.getElementById("f-email").value.trim();
        const phone = document.getElementById("f-phone").value.trim();
        const category = document.getElementById("f-category").value;

        if (!name) {
          alert("Please enter your full name.");
          return;
        }
        if (!company) {
          alert("Please enter your company name.");
          return;
        }
        if (!email || !email.includes("@")) {
          alert("Please enter a valid email address.");
          return;
        }
        if (!phone) {
          alert("Please enter your phone number.");
          return;
        }
        if (!category) {
          alert("Please select your export category.");
          return;
        }

        // Show loading state
        document.getElementById("submitBtnText").textContent = "Submitting...";

        // Simulate submission (replace with real API call)
        setTimeout(() => {
          document.getElementById("modalHeader").classList.add("hide");
          document.getElementById("modalBody").classList.add("hide");
          document.getElementById("modalSuccess").classList.add("show");
        }, 1200);
      }

      document
        .querySelectorAll(".feat-card,.p-card,.impact-card")
        .forEach((card) => {
          card.addEventListener("mouseenter", () => {
            card.style.transition = "none";
          });
          card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            const cx = (e.clientX - r.left) / r.width - 0.5;
            const cy = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateY(${cx * 7}deg) rotateX(${-cy * 7}deg) translateY(-7px) scale(1.01)`;
          });
          card.addEventListener("mouseleave", () => {
            card.style.transition = "transform 0.6s ease";
            card.style.transform = "";
            setTimeout(() => {
              card.style.transition = "";
            }, 600);
          });
        });