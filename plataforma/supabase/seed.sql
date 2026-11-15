-- Catálogo de TARPU generado por backend/herramientas/generar_seed.py (no editar a mano).
-- Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.

insert into public.fuentes (id, nombre, proveedor, url, cita) values
  ('nasa_power', 'NASA POWER', 'NASA Langley Research Center', 'https://power.larc.nasa.gov/', 'NASA POWER Project, https://power.larc.nasa.gov/'),
  ('ornl_modis', 'MODIS (servicio de ORNL DAAC)', 'ORNL DAAC / NASA', 'https://modis.ornl.gov/data/modis_webservice.html', 'ORNL DAAC. MODIS and VIIRS Land Products Global Subsetting and Visualization Tool.'),
  ('soilgrids', 'SoilGrids 2.0', 'ISRIC', 'https://soilgrids.org/', 'Poggio, L. et al. (2021). SoilGrids 2.0. SOIL 7, 217-240.'),
  ('gaez', 'FAO GAEZ v4', 'FAO / IIASA', 'https://gaez.fao.org/', 'FAO GAEZ v4 (cita exacta pendiente)'),
  ('nasadem', 'NASADEM', 'NASA / LP DAAC', 'https://lpdaac.usgs.gov/products/nasadem_hgtv001/', 'NASA JPL (2020). NASADEM_HGT v001.'),
  ('cenagro', 'IV Censo Nacional Agropecuario 2012', 'INEI', 'http://censos1.inei.gob.pe/Cenagro/redatam/', 'INEI (2012). IV CENAGRO.')
on conflict (id) do nothing;

insert into public.productos (id, fuente_id, nombre, version, resolucion_m, frecuencia, malla, nota) values
  ('POWER_DIARIO_AG', 'nasa_power', 'Daily Point API, community AG', 'v2', 55000, 'diaria', 'power: celda de 0,5° x 0,625° (radiación 1° x 1°); clave = centro de la celda', 'Estimación regional de celda, no una medición en el campo.'),
  ('MOD13Q1', 'ornl_modis', 'MODIS/Terra Vegetation Indices 16-Day L3 Global 250m', '061', 231.656358, '16 días', 'modis_sinusoidal: clave = esquina del píxel (xllcorner, yllcorner) en metros', 'El NDVI es verdor; no mide fertilidad.'),
  ('MOD16A2GF', 'ornl_modis', 'MODIS/Terra Net Evapotranspiration Gap-Filled 8-Day L4 500m', '061', 463.312717, '8 días', 'modis_sinusoidal', null),
  ('MOD11A2', 'ornl_modis', 'MODIS/Terra Land Surface Temperature 8-Day L3 1km', '061', 926.625433, '8 días', 'modis_sinusoidal', 'Temperatura de la superficie, no del aire.'),
  ('MCD12Q1', 'ornl_modis', 'MODIS/Terra+Aqua Land Cover Type Yearly L3 500m', '061', 463.312717, 'anual', 'modis_sinusoidal', null),
  ('SOILGRIDS_250M', 'soilgrids', 'SoilGrids 2.0 (WCS)', '2.0', 250, 'estático', 'raster regional', 'Predicción, no un análisis de suelo.'),
  ('GAEZ_RES05', 'gaez', 'GAEZ v4 res05 Suitability Index', 'v4', 9000, 'estático', 'raster regional', null),
  ('NASADEM_HGT', 'nasadem', 'NASADEM_HGT', '001', 30, 'estático', 'raster regional', null)
on conflict (id) do nothing;

insert into public.variables (id, producto_id, nombre, unidad, factor, que_no_dice, meta) values
  ('POWER_DIARIO_AG:T2M', 'POWER_DIARIO_AG', 'Temperature at 2 Meters', 'C', null, null, '{"parametro": "T2M"}'::jsonb),
  ('POWER_DIARIO_AG:T2M_MAX', 'POWER_DIARIO_AG', 'Temperature at 2 Meters Maximum', 'C', null, null, '{"parametro": "T2M_MAX"}'::jsonb),
  ('POWER_DIARIO_AG:T2M_MIN', 'POWER_DIARIO_AG', 'Temperature at 2 Meters Minimum', 'C', null, null, '{"parametro": "T2M_MIN"}'::jsonb),
  ('POWER_DIARIO_AG:T2M_RANGE', 'POWER_DIARIO_AG', 'Temperature at 2 Meters Range', 'C', null, null, '{"parametro": "T2M_RANGE"}'::jsonb),
  ('POWER_DIARIO_AG:PRECTOTCORR', 'POWER_DIARIO_AG', 'Precipitation Corrected', 'mm/day', null, null, '{"parametro": "PRECTOTCORR"}'::jsonb),
  ('POWER_DIARIO_AG:RH2M', 'POWER_DIARIO_AG', 'Relative Humidity at 2 Meters', '%', null, null, '{"parametro": "RH2M"}'::jsonb),
  ('POWER_DIARIO_AG:T2MDEW', 'POWER_DIARIO_AG', 'Dew/Frost Point at 2 Meters', 'C', null, null, '{"parametro": "T2MDEW"}'::jsonb),
  ('POWER_DIARIO_AG:FROST_DAYS', 'POWER_DIARIO_AG', 'Frost Days', 'Days', null, null, '{"parametro": "FROST_DAYS"}'::jsonb),
  ('POWER_DIARIO_AG:ALLSKY_SFC_SW_DWN', 'POWER_DIARIO_AG', 'All Sky Surface Shortwave Downward Irradiance', 'MJ/m^2/day', null, null, '{"parametro": "ALLSKY_SFC_SW_DWN"}'::jsonb),
  ('POWER_DIARIO_AG:ALLSKY_SFC_PAR_TOT', 'POWER_DIARIO_AG', 'All Sky Surface Total PAR', 'MJ/m^2/day', null, null, '{"parametro": "ALLSKY_SFC_PAR_TOT"}'::jsonb),
  ('POWER_DIARIO_AG:CLOUD_AMT', 'POWER_DIARIO_AG', 'Cloud Amount', '%', null, null, '{"parametro": "CLOUD_AMT"}'::jsonb),
  ('POWER_DIARIO_AG:WS2M', 'POWER_DIARIO_AG', 'Wind Speed at 2 Meters', 'm/s', null, null, '{"parametro": "WS2M"}'::jsonb),
  ('POWER_DIARIO_AG:GWETTOP', 'POWER_DIARIO_AG', 'Surface Soil Wetness', '1', null, null, '{"parametro": "GWETTOP"}'::jsonb),
  ('POWER_DIARIO_AG:GWETROOT', 'POWER_DIARIO_AG', 'Root Zone Soil Wetness', '1', null, null, '{"parametro": "GWETROOT"}'::jsonb),
  ('POWER_DIARIO_AG:GWETPROF', 'POWER_DIARIO_AG', 'Profile Soil Wetness', '1', null, null, '{"parametro": "GWETPROF"}'::jsonb),
  ('POWER_DIARIO_AG:TSOIL1', 'POWER_DIARIO_AG', 'Soil Temperatures Layer 1', 'C', null, null, '{"parametro": "TSOIL1"}'::jsonb),
  ('POWER_DIARIO_AG:TSOIL2', 'POWER_DIARIO_AG', 'Soil Temperatures Layer 2', 'C', null, null, '{"parametro": "TSOIL2"}'::jsonb),
  ('POWER_DIARIO_AG:TS_MIN', 'POWER_DIARIO_AG', 'Earth Skin Temperature Minimum', 'C', null, null, '{"parametro": "TS_MIN"}'::jsonb),
  ('POWER_DIARIO_AG:EVLAND', 'POWER_DIARIO_AG', 'Evaporation Land', 'mm/day', null, null, '{"parametro": "EVLAND"}'::jsonb),
  ('MOD13Q1:250m_16_days_NDVI', 'MOD13Q1', '16 day NDVI average', 'NDVI ratio - No units', 0.0001, null, '{"valid_range": "-2000 to 10000", "fill_value": "-3000", "add_offset": "0"}'::jsonb),
  ('MOD13Q1:250m_16_days_pixel_reliability', 'MOD13Q1', 'Quality reliability of VI pixel', 'rank', null, null, '{"valid_range": "0 to 3", "fill_value": "-1", "add_offset": null}'::jsonb),
  ('MOD16A2GF:ET_500m', 'MOD16A2GF', 'Evapotranspiration', 'kg/m^2/8day', 0.1, null, '{"valid_range": "-32767 to 32700", "fill_value": "32767", "add_offset": "0"}'::jsonb),
  ('MOD16A2GF:PET_500m', 'MOD16A2GF', 'Potential evapotranspiration', 'kg/m^2/8day', 0.1, null, '{"valid_range": "-32767 to 32700", "fill_value": "32767", "add_offset": "0"}'::jsonb),
  ('MOD11A2:LST_Day_1km', 'MOD11A2', 'Daytime Land Surface Temperature', 'Kelvin', 0.02, null, '{"valid_range": "7500 to 65535", "fill_value": "0", "add_offset": "0"}'::jsonb),
  ('MOD11A2:LST_Night_1km', 'MOD11A2', 'Night Land Surface Temperature', 'Kelvin', 0.02, null, '{"valid_range": "7500 to 65535", "fill_value": "0", "add_offset": "0"}'::jsonb),
  ('MCD12Q1:LC_Type1', 'MCD12Q1', 'Land Cover Type 1: Annual International Geosphere-Biosphere Programme (IGBP) classification', 'class', null, null, '{"valid_range": "1 to 17", "fill_value": "255", "add_offset": null}'::jsonb)
on conflict (id) do nothing;
