--
-- PostgreSQL database dump
--

\restrict Lya5Oh6Jl7B9o9sM3HnO3wZIkqrfkLe0Q6KXUgMCSD2iXRU5MTP9oZxSk2o9ZaH

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-10-26 03:55:12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 864 (class 1247 OID 16784)
-- Name: categoria; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categoria AS ENUM (
    'cafeteria',
    'barberia',
    'car_wash',
    'otros'
);


ALTER TYPE public.categoria OWNER TO postgres;

--
-- TOC entry 861 (class 1247 OID 16776)
-- Name: rol; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol AS ENUM (
    'cliente',
    'negocio',
    'admin'
);


ALTER TYPE public.rol OWNER TO postgres;

--
-- TOC entry 226 (class 1255 OID 16793)
-- Name: trigger_actualizar_timestamp_actualizado_en(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_actualizar_timestamp_actualizado_en() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_actualizar_timestamp_actualizado_en() OWNER TO postgres;

--
-- TOC entry 228 (class 1255 OID 16795)
-- Name: trigger_sincronizar_cache_promociones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_sincronizar_cache_promociones() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Actualiza todas las promociones vinculadas con el nuevo nombre
  UPDATE promociones
  SET 
    nombre_negocio = NEW.nombre_negocio
  WHERE id_negocio = NEW.id_usuario; 
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_sincronizar_cache_promociones() OWNER TO postgres;

--
-- TOC entry 227 (class 1255 OID 16794)
-- Name: trigger_sincronizar_cache_tarjetas_lealtad(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_sincronizar_cache_tarjetas_lealtad() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Actualiza todas las tarjetas de cliente vinculadas con la nueva info del negocio
  UPDATE tarjetas_lealtad
  SET 
    cache_nombre_negocio = NEW.nombre_negocio,
    cache_imagen_tarjeta_url = NEW.tarjeta_config ->> 'imagen_fondo_url',
    cache_nombre_premio = NEW.tarjeta_config -> 'premio' ->> 'nombre_premio',
    cache_sellos_requeridos = (NEW.tarjeta_config -> 'premio' ->> 'sellos_requeridos')::INT
  WHERE id_negocio = NEW.id_usuario; 
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_sincronizar_cache_tarjetas_lealtad() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16818)
-- Name: negocios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.negocios (
    id_usuario integer NOT NULL,
    nombre_negocio text NOT NULL,
    rubro public.categoria NOT NULL,
    ubicacion_local_lat double precision,
    ubicacion_local_lon double precision,
    tarjeta_config jsonb DEFAULT '{"premio": {"descripcion": "", "valor_aprox": "0.00", "nombre_premio": "Premio por defecto", "sellos_requeridos": 10}, "nombre_tarjeta": "Tarjeta de Lealtad", "imagen_fondo_url": null}'::jsonb NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.negocios OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16840)
-- Name: promociones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promociones (
    id integer NOT NULL,
    id_negocio integer NOT NULL,
    nombre_negocio text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    inicia_en timestamp with time zone NOT NULL,
    termina_en timestamp with time zone NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.promociones OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16839)
-- Name: promociones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promociones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promociones_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 222
-- Name: promociones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promociones_id_seq OWNED BY public.promociones.id;


--
-- TOC entry 225 (class 1259 OID 16865)
-- Name: tarjetas_lealtad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarjetas_lealtad (
    id integer NOT NULL,
    id_cliente integer NOT NULL,
    id_negocio integer NOT NULL,
    cantidad_sellos integer DEFAULT 0 NOT NULL,
    favorita boolean DEFAULT false NOT NULL,
    cache_nombre_negocio text NOT NULL,
    cache_imagen_tarjeta_url text,
    cache_nombre_premio text,
    cache_sellos_requeridos integer NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tarjetas_lealtad OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16864)
-- Name: tarjetas_lealtad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarjetas_lealtad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarjetas_lealtad_id_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 224
-- Name: tarjetas_lealtad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarjetas_lealtad_id_seq OWNED BY public.tarjetas_lealtad.id;


--
-- TOC entry 220 (class 1259 OID 16797)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre text,
    correo text NOT NULL,
    hash_contrasena text NOT NULL,
    rol public.rol DEFAULT 'cliente'::public.rol NOT NULL,
    negocio_solicitado boolean DEFAULT false NOT NULL,
    ubicacion_actual_lat double precision,
    ubicacion_actual_lon double precision,
    token_dispositivo text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16796)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4887 (class 2604 OID 16843)
-- Name: promociones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones ALTER COLUMN id SET DEFAULT nextval('public.promociones_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16868)
-- Name: tarjetas_lealtad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_lealtad ALTER COLUMN id SET DEFAULT nextval('public.tarjetas_lealtad_id_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 16800)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5071 (class 0 OID 16818)
-- Dependencies: 221
-- Data for Name: negocios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.negocios (id_usuario, nombre_negocio, rubro, ubicacion_local_lat, ubicacion_local_lon, tarjeta_config, creado_en, actualizado_en) FROM stdin;
5	Barbería El Corte	barberia	13.9945	-89.554	{"premio": {"descripcion": "En tu 5ta visita", "valor_aprox": "5.00", "nombre_premio": "Corte de Barba", "sellos_requeridos": 4}, "nombre_tarjeta": "Cliente Frecuente", "imagen_fondo_url": "https://i.imgur.com/zW6p4Q7.jpeg"}	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
6	Carwash BrilloTotal	car_wash	13.4833	-88.1833	{"premio": {"descripcion": "En tu 8va visita", "valor_aprox": "15.00", "nombre_premio": "Lavado Full", "sellos_requeridos": 7}, "nombre_tarjeta": "Auto Impecable", "imagen_fondo_url": "https://i.imgur.com/R3x3fK2.jpeg"}	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
4	Café El Naranjo	cafeteria	13.6989	-89.1914	{"premio": {"descripcion": "En tu 6ta visita", "valor_aprox": "3.50", "nombre_premio": "pruebabaratoCon1", "sellos_requeridos": 1}, "nombre_tarjeta": "Fan del Café", "imagen_fondo_url": "https://i.imgur.com/nJ3z1Wc.jpeg"}	2025-10-26 00:45:30.680418-06	2025-10-26 03:08:06.155169-06
8	Manu	otros	\N	\N	{"premio": {"descripcion": "", "valor_aprox": "0.00", "nombre_premio": "Premio por defecto", "sellos_requeridos": 10}, "nombre_tarjeta": "Tarjeta de Lealtad", "imagen_fondo_url": null}	2025-10-26 03:38:30.980023-06	2025-10-26 03:38:30.980023-06
\.


--
-- TOC entry 5073 (class 0 OID 16840)
-- Dependencies: 223
-- Data for Name: promociones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promociones (id, id_negocio, nombre_negocio, nombre, descripcion, inicia_en, termina_en, creado_en, actualizado_en) FROM stdin;
1	4	Café El Naranjo	Jueves 2x1 en Lattes	Compra un latte y llévate el segundo gratis todo el día.	2025-10-01 00:00:00-06	2025-11-30 23:59:59-06	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
2	5	Barbería El Corte	Miércoles de Amigos	Trae un amigo y ambos reciben 20% de descuento.	2025-10-15 00:00:00-06	2025-12-15 23:59:59-06	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
3	6	Carwash BrilloTotal	Fin de Semana Full	Lavado completo a precio de básico (Viernes a Domingo)	2025-10-20 00:00:00-06	2025-11-20 23:59:59-06	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
4	8	Manu	Martes de Aleros	2x1 en Alas.	2025-11-01 00:00:00-06	2025-11-30 06:00:00-06	2025-10-26 03:49:48.82823-06	2025-10-26 03:49:48.82823-06
\.


--
-- TOC entry 5075 (class 0 OID 16865)
-- Dependencies: 225
-- Data for Name: tarjetas_lealtad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarjetas_lealtad (id, id_cliente, id_negocio, cantidad_sellos, favorita, cache_nombre_negocio, cache_imagen_tarjeta_url, cache_nombre_premio, cache_sellos_requeridos, creado_en, actualizado_en) FROM stdin;
2	3	5	1	f	Barbería El Corte	https://i.imgur.com/zW6p4Q7.jpeg	Corte de Barba	4	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
3	2	5	0	f	Barbería El Corte	https://i.imgur.com/zW6p4Q7.jpeg	Corte de Barba	4	2025-10-26 00:45:30.680418-06	2025-10-26 00:45:30.680418-06
4	3	4	2	f	Café El Naranjo	https://i.imgur.com/nJ3z1Wc.jpeg	pruebabaratoCon1	1	2025-10-26 01:44:04.317879-06	2025-10-26 03:08:06.165266-06
8	8	4	2	f	Café El Naranjo	https://i.imgur.com/nJ3z1Wc.jpeg	pruebabaratoCon1	1	2025-10-26 02:10:51.300915-06	2025-10-26 03:08:06.165266-06
1	2	4	0	t	Café El Naranjo	https://i.imgur.com/nJ3z1Wc.jpeg	pruebabaratoCon1	1	2025-10-26 00:45:30.680418-06	2025-10-26 03:08:58.905296-06
\.


--
-- TOC entry 5070 (class 0 OID 16797)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, correo, hash_contrasena, rol, negocio_solicitado, ubicacion_actual_lat, ubicacion_actual_lon, token_dispositivo, creado_en, actualizado_en) FROM stdin;
2	Ana Cliente	ana@cliente.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	cliente	f	13.7005	-89.203	\N	2025-10-26 00:45:30.680418-06	2025-10-26 02:44:55.597688-06
4	Carlos Dueño	cafe@negocio.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	negocio	t	\N	\N	\N	2025-10-26 00:45:30.680418-06	2025-10-26 02:44:55.597688-06
5	Daniel Dueño	barberia@negocio.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	negocio	t	\N	\N	\N	2025-10-26 00:45:30.680418-06	2025-10-26 02:44:55.597688-06
6	Elena Dueña	carwash@negocio.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	negocio	t	\N	\N	\N	2025-10-26 00:45:30.680418-06	2025-10-26 02:44:55.597688-06
7	Admin Sellify	admin@sellify.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	admin	f	\N	\N	\N	2025-10-26 00:45:30.680418-06	2025-10-26 02:44:55.597688-06
3	Beto Cliente	beto@cliente.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	cliente	t	13.9934	-89.5592	\N	2025-10-26 00:45:30.680418-06	2025-10-26 03:19:24.884241-06
8	Manu	manu@nuevo.com	$2b$10$fgssl7GVi6mrd.FC9mu8duvL/LCBvcPVBbtUqshs0zbR.CvHv02tO	negocio	f	\N	\N	\N	2025-10-26 02:10:09.677345-06	2025-10-26 03:38:30.980023-06
\.


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 222
-- Name: promociones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promociones_id_seq', 4, true);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 224
-- Name: tarjetas_lealtad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarjetas_lealtad_id_seq', 14, true);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 8, true);


--
-- TOC entry 4900 (class 2606 OID 16833)
-- Name: negocios negocios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.negocios
    ADD CONSTRAINT negocios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4904 (class 2606 OID 16858)
-- Name: promociones promociones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones
    ADD CONSTRAINT promociones_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 16887)
-- Name: tarjetas_lealtad tarjetas_lealtad_cliente_negocio_unico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_lealtad
    ADD CONSTRAINT tarjetas_lealtad_cliente_negocio_unico UNIQUE (id_cliente, id_negocio);


--
-- TOC entry 4911 (class 2606 OID 16885)
-- Name: tarjetas_lealtad tarjetas_lealtad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_lealtad
    ADD CONSTRAINT tarjetas_lealtad_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 16817)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 4898 (class 2606 OID 16815)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 1259 OID 16902)
-- Name: negocios_tarjeta_config_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX negocios_tarjeta_config_gin ON public.negocios USING gin (tarjeta_config);


--
-- TOC entry 4902 (class 1259 OID 16900)
-- Name: promociones_id_negocio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promociones_id_negocio_idx ON public.promociones USING btree (id_negocio);


--
-- TOC entry 4905 (class 1259 OID 16901)
-- Name: promociones_ventana_activa_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX promociones_ventana_activa_idx ON public.promociones USING btree (inicia_en, termina_en);


--
-- TOC entry 4908 (class 1259 OID 16898)
-- Name: tarjetas_lealtad_id_cliente_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tarjetas_lealtad_id_cliente_idx ON public.tarjetas_lealtad USING btree (id_cliente);


--
-- TOC entry 4909 (class 1259 OID 16899)
-- Name: tarjetas_lealtad_id_negocio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tarjetas_lealtad_id_negocio_idx ON public.tarjetas_lealtad USING btree (id_negocio);


--
-- TOC entry 4917 (class 2620 OID 16904)
-- Name: negocios trigger_negocios_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_negocios_actualizado_en BEFORE UPDATE ON public.negocios FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_timestamp_actualizado_en();


--
-- TOC entry 4920 (class 2620 OID 16905)
-- Name: promociones trigger_promociones_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_promociones_actualizado_en BEFORE UPDATE ON public.promociones FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_timestamp_actualizado_en();


--
-- TOC entry 4918 (class 2620 OID 16908)
-- Name: negocios trigger_sync_promociones_cache_on_negocio_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_sync_promociones_cache_on_negocio_update AFTER UPDATE ON public.negocios FOR EACH ROW WHEN ((old.nombre_negocio IS DISTINCT FROM new.nombre_negocio)) EXECUTE FUNCTION public.trigger_sincronizar_cache_promociones();


--
-- TOC entry 4919 (class 2620 OID 16907)
-- Name: negocios trigger_sync_tarjetas_cache_on_negocio_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_sync_tarjetas_cache_on_negocio_update AFTER UPDATE ON public.negocios FOR EACH ROW WHEN ((old.* IS DISTINCT FROM new.*)) EXECUTE FUNCTION public.trigger_sincronizar_cache_tarjetas_lealtad();


--
-- TOC entry 4921 (class 2620 OID 16906)
-- Name: tarjetas_lealtad trigger_tarjetas_lealtad_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_tarjetas_lealtad_actualizado_en BEFORE UPDATE ON public.tarjetas_lealtad FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_timestamp_actualizado_en();


--
-- TOC entry 4916 (class 2620 OID 16903)
-- Name: usuarios trigger_usuarios_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_usuarios_actualizado_en BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.trigger_actualizar_timestamp_actualizado_en();


--
-- TOC entry 4912 (class 2606 OID 16834)
-- Name: negocios negocios_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.negocios
    ADD CONSTRAINT negocios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4913 (class 2606 OID 16859)
-- Name: promociones promociones_id_negocio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones
    ADD CONSTRAINT promociones_id_negocio_fkey FOREIGN KEY (id_negocio) REFERENCES public.negocios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4914 (class 2606 OID 16888)
-- Name: tarjetas_lealtad tarjetas_lealtad_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_lealtad
    ADD CONSTRAINT tarjetas_lealtad_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4915 (class 2606 OID 16893)
-- Name: tarjetas_lealtad tarjetas_lealtad_id_negocio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarjetas_lealtad
    ADD CONSTRAINT tarjetas_lealtad_id_negocio_fkey FOREIGN KEY (id_negocio) REFERENCES public.negocios(id_usuario) ON DELETE CASCADE;


-- Completed on 2025-10-26 03:55:13

--
-- PostgreSQL database dump complete
--

\unrestrict Lya5Oh6Jl7B9o9sM3HnO3wZIkqrfkLe0Q6KXUgMCSD2iXRU5MTP9oZxSk2o9ZaH

