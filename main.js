let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');

canvas.width = 600
canvas.height = 860

function rand(min, max) {
   return Math.random() * (max - min) + min;
}

function distance(x1, y1, x2, y2) {
   return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
   }


class MyCar {
   constructor(Road) {
      this.road = Road;
      this.width = 100
      this.height = 168
      this.x = (this.road.width/2)-(this.width/2)
      this.y = 400
      this.image = document.createElement('img');
      this.image.src="cars/mycar.png";
      this.left = false;
      this.right = false;
      this.middle = false;

   }
   update() {
      if (this.left) {
         this.x -= this.road.speed/100;
         if (this.x < (this.road.width/6)-(this.width/2)) {
            this.left = false;
         }

      }
      if (this.right) {
         this.x += this.road.speed/100;;
         if (this.x > (this.road.width*5/6)-(this.width/2)) {
            this.right = false;
         }

      }
      if (this.middle) {
         if (this.x > (this.road.width/2)-(this.width/2)) {
            this.x -= this.road.speed/100;
         }
         else {
            this.x += this.road.speed/100;
         }
         if (this.x < (this.road.width/2)-(this.width/2) + 5 && this.x > (this.road.width/2)-(this.width/2) - 5) {
            this.middle = false;
         }

      }
   }

   draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height)
   }
}

class Car {
   constructor(Road, cardata) {
      this.road = Road
      this.width = cardata[1] * 4/5
      this.height = cardata[2] * 4/5
      let index = Math.floor(rand(0, 3))

      let poslist = [1, 3, 5]
      let speedlist = [110, 90, 70]
      this.speed = speedlist[index]
      this.x = poslist[index]*(this.road.width/6)-(this.width/2)
      this.y = -this.height 
      //hogyha a legmesszebb lévő kocsi messzebb van mint a látható ut vége akkor a legmeszebb lévő kocsi elé tegyen be ujat különben a látható ut végére tegye
      if (Math.min(...Road.carYpos) -this.height < -this.height) {
         this.y = Math.min(...Road.carYpos) -this.height - 50
         
      }
      //console.log(Math.min(...Road.carYpos) -this.height, -this.height)
      
      this.image = document.createElement('img');
      this.image.src = 'cars/' + cardata[0]
   }
   update() {
      this.y += (this.road.speed - this.speed)/50
   }

   draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height)
   }
}


class RoadLines {
 constructor(Road, ypos, xpos) {
   this.road = Road
   this.y = ypos
   this.x = xpos
   

 }
   update() {
      this.y += this.road.speed/30;
   }

   draw(ctx) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, 10, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
   }
}



class Road {
   constructor (width, height) {
      this.width = width
      this.height = height
      this.maxspeed = 180
      this.senzor = this.maxspeed*2
      this.speed = this.maxspeed
      this.leftlines = []
      this.Rightlines = []
      this.mycar = new MyCar(this)
      
      
      this.newcarcooldown = 20;
      this.cars = {};
      this.carlist = []
      this.carYpos = []

      for (var i = 0; i < 20; i++) {
         this.leftlines.push(new RoadLines(this, 60*i, (this.width/3) - 10))
         this.Rightlines.push(new RoadLines(this, 60*i, (this.width/1.5) - 10))
      }

      this.leftblock = false;
      this.rightblock = false;

   }
   update() {
      document.querySelector('.speed strong').innerHTML = Math.floor(this.speed)

      //kilépett vonalak törlése
      this.leftlines = this.leftlines.filter(t => t.y <= this.height)
      this.Rightlines = this.Rightlines.filter(t => t.y <= this.height)
      this.carlist = this.carlist.filter(t => t.y <= this.height)

      //ha a legújabb vonal 10pixelt megtett akkor jöhet a következő
      if (this.leftlines[0].y > 10) {
         this.leftlines.unshift(new RoadLines(this, -50, (600/3) - 10))
      }
      if (this.Rightlines[0].y > 10) {
         this.Rightlines.unshift(new RoadLines(this, -50, (600/1.5) - 10))
      }
      
      this.leftlines.forEach(l => {
         l.update()
      });
      this.Rightlines.forEach(l => {
         l.update()
      });

      
      this.mycar.update();

      //new car

      this.cars = {
         'car1': ['car1.png', 124, 249],
         'car2': ['car2.png', 119, 256],
         'car3': ['car3.png', 120, 243],
         'car4': ['car4.png', 118, 266],
         'car5': ['car5.png', 122, 234],
         'car6': ['car6.png', 126, 220]
      }

      this.newcarcooldown--
      if (this.newcarcooldown < 0) {
         this.newcarcooldown = 100;
         //ha 10nél kevesebb auto van akkor adjon hozzá egyet 300frames idözitésenként
         if (this.carlist.length < 10) {
            this.carlist.push(new Car(this, this.cars[`car${Math.floor(rand(1, 7))}`]))
         }
      }
      //console.log(this.carlist)
      this.carYpos = []
      this.carlist.forEach(car => {
         car.update()
         this.carYpos.push(car.y)
      });
      

      //érzékeli a körülötte lévő autók számát

      this.senzor = this.speed*2
 
      //érzékeli a körülötte lévő autók számát
      let forwardcars = this.carlist.filter( car => 
         car.x - 50 < this.mycar.x && car.x + 50 > this.mycar.x && this.mycar.y - this.senzor - car.height < car.y && this.mycar.y + this.mycar.height + 1000/this.senzor*5 > car.y).length;

      let leftcars = this.carlist.filter( car => 
         this.mycar.x - 50 > car.x && this.mycar.x - 50 - this.width/3 < car.x && this.mycar.y - this.senzor - car.height < car.y && this.mycar.y + this.mycar.height + 1000/this.senzor*5 > car.y).length;

      let rightcars = this.carlist.filter( car => 
         this.mycar.x + 50 < car.x && this.mycar.x + 50 + this.width/1.5 > car.x && this.mycar.y - this.senzor - car.height < car.y && this.mycar.y + this.mycar.height + 1000/this.senzor*5 > car.y).length;

      console.log(leftcars, forwardcars, rightcars, this.mycar.x - 50 - this.width/3, this.mycar.x - 50 + this.width/1.5)

      //ellenörzi a pozíciót és hogy alkalmas e a kanyarodás és az alapján állitja a kocsi pozíció váltás értékét 
      if (forwardcars > 0) {
         if (leftcars == 0 && this.width/3 < this.mycar.x && this.width/1.5 > this.mycar.x && !this.mycar.right) {
            this.mycar.left = true
         }
         else if (rightcars == 0 && this.width/1.5 > this.mycar.x && this.width/3 < this.mycar.x && !this.mycar.left) {
            this.mycar.right = true
         }
         else if (rightcars == 0 && leftcars == 0 && !this.mycar.right && !this.mycar.left) {
            this.mycar.middle = true
         }
         //lassitás sebességtől függöen előre nézi és kalkulálja hogy mennyire lassitson le
         let nearestcar = this.carlist.filter(car => car.x - 50 < this.mycar.x && car.x + 50 > this.mycar.x && this.mycar.y - this.senzor - car.height < car.y)[0]
         if (this.mycar.y - nearestcar.y < this.senzor*2
         && this.speed > nearestcar.speed)
         {
            this.speed -= .5;
         }
         if (this.mycar.y - nearestcar.y < nearestcar.height*1.5
         && this.speed > nearestcar.speed)
         {
            this.speed -= 2;
         }


      }
      //ha nincsen elötte auto és nem max sebességgel megy akkor gyorsitson fel a megengedett sebességre
      if (forwardcars == 0 && this.speed < this.maxspeed) {
         this.speed += .5;
      }


      

   }

   draw(ctx) {
      this.leftlines.forEach(l => {
         l.draw(ctx)
      });
      this.Rightlines.forEach(l => {
         l.draw(ctx)
      });
      
      this.mycar.draw(ctx);


      this.carlist.forEach(car => {
         car.draw(ctx)
      });

   }

}



const road = new Road(canvas.width, canvas.height)

function animate() {
   context.clearRect(0, 0, canvas.width, canvas.height)
   road.update()
   road.draw(context);
   requestAnimationFrame(animate);
}
animate()
