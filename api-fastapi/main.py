import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Optional

DATABASE_URL = "sqlite:///./clima.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Clima(Base):
    __tablename__ = "clima"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, unique=True, index=True)
    cod = Column(Integer, default=200)
    
    weather_desc = Column(String)
    weather_icon = Column(String)
    
    main_temp = Column(Numeric(5, 1))
    main_humidity = Column(Integer)
    
    wind_speed = Column(Numeric(4, 1))
    
    name = Column(String)
    sys_country = Column(String)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    count = db.query(Clima).count()
    if count == 0:
        print("La BD esta vacia. Se ingresan datos predeterminados.")

        db.add(Clima(
            query="Coquimbo,cl",
            cod=200,
            weather_desc="nubes dispersas",
            weather_icon="03d",
            main_temp=18.5,
            main_humidity=77,
            wind_speed=4.1,
            name="Coquimbo",
            sys_country="CL"
        ))
        
        db.add(Clima(
            query="Tokyo",
            cod=200,
            weather_desc="parcialmente nublado",
            weather_icon="02d",
            main_temp=22.0,
            main_humidity=65,
            wind_speed=3.0,
            name="Tokyo",
            sys_country="JP"
        ))
        
        db.add(Clima(
            query="Madrid,es",
            cod=200,
            weather_desc="soleado",
            weather_icon="01d",
            main_temp=25.0,
            main_humidity=30,
            wind_speed=2.5,
            name="Madrid",
            sys_country="ES"
        ))
        db.commit()
    else:
        print("La BD tiene datos")
    db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/weather")
def get_weather(q: str, db: Session = Depends(get_db)):    
    clima_data = db.query(Clima).filter(Clima.query == q).first()
    
    if clima_data:
        return {
            "cod": clima_data.cod,
            "weather": [{
                "description": clima_data.weather_desc, 
                "icon": clima_data.weather_icon
            }],
            "main": {
                "temp": clima_data.main_temp, 
                "humidity": clima_data.main_humidity
            },
            "wind": {
                "speed": clima_data.wind_speed
            },
            "name": clima_data.name,
            "sys": {
                "country": clima_data.sys_country
            }
        }
    else:
        return {"cod": 404, "message": "city not found"}

if __name__ == "__main__":
    # Usar puerto 8001 para evitar conflictos con servidores locales en 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)