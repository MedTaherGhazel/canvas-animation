@ViewChild('canvas', { static: true }) canvasRef!: ElementRef;
  @ViewChild('largeHeader', { static: true }) largeHeaderRef!: ElementRef;

  private width!: number;
  private height!: number;
  private ctx!: CanvasRenderingContext2D;
  private points: any[] = [];
  private target: any = { x: 0, y: 0 };
  private animateHeader = true;
  private scrollY=0;

  ngOnInit() {
    this.initHeader();
    this.initAnimation();
    this.addListeners();
  }

  initHeader() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.target = { x: this.width / 2, y: this.height / 2 };

    const largeHeader = this.largeHeaderRef.nativeElement;
    largeHeader.style.height = this.height + 'px';

    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext('2d');

    this.points = [];
    for (let x = 0; x < this.width; x = x + this.width / 20) {
      for (let y = 0; y < this.height; y = y + this.height / 20) {
        const px = x + Math.random() * this.width / 20;
        const py = y + Math.random() * this.height / 20;
        const p = { x: px, originX: px, y: py, originY: py };
        this.points.push(p);
      }
    }

    for (const p1 of this.points) {
      const closest = [];
      for (const p2 of this.points) {
        if (!(p1 === p2)) {
          let placed = false;
          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (closest[k] === undefined) {
                closest[k] = p2;
                placed = true;
              }
            }
          }

          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (this.getDistance(p1, p2) < this.getDistance(p1, closest[k])) {
                closest[k] = p2;
                placed = true;
              }
            }
          }
        }
      }
      p1.closest = closest;
    }

    for (const p of this.points) {
      const c = new Circle(this.ctx, p, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
      p.circle = c;
    }
  }

  addListeners() {
    window.addEventListener('mousemove', this.mouseMove.bind(this));
    window.addEventListener('scroll', this.scrollCheck.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
  }

  mouseMove(e: MouseEvent) {
    const posx = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    const posy =  e.clientY ;
    this.target.x = posx;
    this.target.y = posy;
  }

  scrollCheck() {
    this.scrollY = window.scrollY || window.pageYOffset;
    if (this.scrollY <= window.innerHeight) {
     this.target.y += this.scrollY;
    }
   }



  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.largeHeaderRef.nativeElement.style.height = this.height + 'px';
    this.canvasRef.nativeElement.width = this.width;
    this.canvasRef.nativeElement.height = this.height;
  }

  initAnimation() {
    this.animate();
    for (const p of this.points) {
      this.shiftPoint(p);
    }
  }

  animate() {
    if (this.animateHeader) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      for (const p of this.points) {
        if (Math.abs(this.getDistance(this.target, p)) < 4000) {
          p.active = 0.3;
          p.circle.active = 0.6;
        }
         else if (Math.abs(this.getDistance(this.target, p)) < 20000) {
          p.active = 0.1;
          p.circle.active = 0.3;
        } else if (Math.abs(this.getDistance(this.target, p)) < 40000) {
          p.active = 0.02;
          p.circle.active = 0.1;
        } else {
          p.active = 0;
          p.circle.active = 0;
        }
        this.drawLines(p);
        p.circle.draw();
      }
    }
    requestAnimationFrame(() => this.animate());
  }

  shiftPoint(p: { originX: number, originY: number, x: number, y: number }) {
    TweenMax.to(p, 1 + 1 * Math.random(), {
      x: p.originX - 50 + Math.random() * 100,
      y: p.originY - 50 + Math.random() * 100,
      ease: Circ.easeInOut,
      onComplete: () => this.shiftPoint(p)
    });
  }

  drawLines(p: { active: string; closest: any; x: number; y: number; }) {
    if (!p.active) {
      return;
    }
    for (const closePoint of p.closest) {
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(closePoint.x, closePoint.y);
      this.ctx.strokeStyle = 'rgba(0,255,0,' + p.active + ')'; // Green color
      this.ctx.stroke();
    }
  }
