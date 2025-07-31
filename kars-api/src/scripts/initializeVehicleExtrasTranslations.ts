import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Traducciones de extras de vehículos
const vehicleExtrasTranslations = [
  // EXTRES I COMPLEMENTS COTXE
  { key: 'abs', ca: 'ABS', es: 'ABS', en: 'ABS', fr: 'ABS', category: 'extras_cotxe' },
  { key: 'airbag_conductor', ca: 'Airbag conductor', es: 'Airbag conductor', en: 'Driver airbag', fr: 'Airbag conducteur', category: 'extras_cotxe' },
  { key: 'airbag_passatger', ca: 'Airbag passatger', es: 'Airbag pasajero', en: 'Passenger airbag', fr: 'Airbag passager', category: 'extras_cotxe' },
  { key: 'airbag_cortina', ca: 'Airbag cortina', es: 'Airbag de cortina', en: 'Curtain airbag', fr: 'Airbag rideau', category: 'extras_cotxe' },
  { key: 'airbag_genolls', ca: 'Airbag genolls', es: 'Airbag de rodilla', en: 'Knee airbag', fr: 'Airbag genoux', category: 'extras_cotxe' },
  { key: 'airbag_laterals', ca: 'Airbag laterals', es: 'Airbags laterales', en: 'Side airbags', fr: 'Airbags latéraux', category: 'extras_cotxe' },
  { key: 'alarma', ca: 'Alarma', es: 'Alarma', en: 'Alarm', fr: 'Alarme', category: 'extras_cotxe' },
  { key: 'aparcament_control_remot', ca: 'Aparcament control remot', es: 'Control remoto de aparcamiento', en: 'Remote parking control', fr: 'Stationnement à distance', category: 'extras_cotxe' },
  { key: 'apple_carplay_android_auto', ca: 'Apple Car Play / Android Auto', es: 'Apple CarPlay / Android Auto', en: 'Apple CarPlay / Android Auto', fr: 'Apple CarPlay / Android Auto', category: 'extras_cotxe' },
  { key: 'arrancada_sense_clau_keyless', ca: 'Arrancada sense clau Keyless', es: 'Arranque sin llave (Keyless)', en: 'Keyless', fr: 'Démarrage sans clé Keyless', category: 'extras_cotxe' },
  { key: 'assist_aparcament', ca: 'Assist. aparcament', es: 'Asist. de aparcamiento', en: 'Parking assist', fr: 'Assist. de stationnement', category: 'extras_cotxe' },
  { key: 'assist_manteniment_carril', ca: 'Assist. manteniment carril', es: 'Asist. de mantenimiento de carril', en: 'Lane keeping assist', fr: 'Assist. maintien de voie', category: 'extras_cotxe' },
  { key: 'assist_manteniment_carril_protec_collisio', ca: 'Assist. manteniment carril i protec col·lisió lateral', es: 'Asist. mantenimiento carril y protección lateral', en: 'Lane assist & side collision protect', fr: 'Assist. maintien voie et protection latérale', category: 'extras_cotxe' },
  { key: 'assist_collisio_lateral', ca: 'Assist. col·lisió lateral', es: 'Asist. de colisión lateral', en: 'Side collision assist', fr: 'Assist. de collision latérale', category: 'extras_cotxe' },
  { key: 'assist_collisio_per_abast', ca: 'Assist. col·lisió per abast', es: 'Asist. de colisión por alcance', en: 'Rear-end collision assist', fr: 'Assist. collision arrière', category: 'extras_cotxe' },
  { key: 'assist_marxa_enrere', ca: 'Assist. marxa enrere', es: 'Asist. de marcha atrás', en: 'Reverse assist', fr: 'Assist. marche arrière', category: 'extras_cotxe' },
  { key: 'assist_parada_emergencia', ca: 'Assist. parada emergència', es: 'Asist. de frenado de emergencia', en: 'Emergency braking assist', fr: "Assist. freinage d'urgence", category: 'extras_cotxe' },
  { key: 'auto_aparcament', ca: 'Auto aparcament', es: 'Aparcamiento automático', en: 'Automatic parking', fr: 'Auto stationnement', category: 'extras_cotxe' },
  { key: 'avis_angle_mort', ca: 'Avís angle mort', es: 'Aviso de ángulo muerto', en: 'Blind spot warning', fr: 'Alerte angle mort', category: 'extras_cotxe' },
  { key: 'avis_canvi_involuntari_carril', ca: 'Avís canvi involuntari carril', es: 'Aviso cambio involuntario de carril', en: 'Lane departure warning', fr: 'Alerte franchissement involontaire', category: 'extras_cotxe' },
  { key: 'avis_de_collisio_a_encreuament', ca: 'Avís de col·lisió a encreuament', es: 'Aviso colisión en cruce', en: 'Intersection collision warning', fr: 'Alerte collision croisement', category: 'extras_cotxe' },
  { key: 'avis_collisio_frontal', ca: 'Avís col·lisió frontal', es: 'Aviso colisión frontal', en: 'Front collision warning', fr: 'Alerte collision frontale', category: 'extras_cotxe' },
  { key: 'avis_per_cansament', ca: 'Avís per cansament', es: 'Aviso por fatiga', en: 'Drowsiness alert', fr: 'Alerte fatigue', category: 'extras_cotxe' },
  { key: 'avis_sentit_erroni_de_la_marca', ca: 'Avís sentit erroni de la marca', es: 'Aviso sentido incorrecto', en: 'Wrong-way alert', fr: 'Alerte de sens interdit', category: 'extras_cotxe' },
  { key: 'avis_situacions_de_risc', ca: 'Avís situacions de risc', es: 'Aviso situaciones riesgo', en: 'Hazard alert', fr: 'Alerte situations à risque', category: 'extras_cotxe' },
  { key: 'avis_transit_creuat', ca: 'Avís trànsit creuat', es: 'Aviso tráfico cruzado', en: 'Cross traffic alert', fr: 'Alerte trafic transversal', category: 'extras_cotxe' },
  { key: 'bluetooth', ca: 'Bluetooth', es: 'Bluetooth', en: 'Bluetooth', fr: 'Bluetooth', category: 'extras_cotxe' },
  { key: 'camera_visio_davant', ca: 'Càmera visió davant', es: 'Cámara delantera', en: 'Front view camera', fr: 'Caméra avant', category: 'extras_cotxe' },
  { key: 'camera_visio_posterior', ca: 'Càmera visió posterior', es: 'Cámara trasera', en: 'Rear view camera', fr: 'Caméra arrière', category: 'extras_cotxe' },
  { key: 'camera_visio_360', ca: 'Càmera visió 360º', es: 'Cámara 360º', en: '360° view camera', fr: 'Caméra 360°', category: 'extras_cotxe' },
  { key: 'carregador_inalambric', ca: 'Carregador inalàmbric', es: 'Cargador inalámbrico', en: 'Wireless charger', fr: 'Chargeur sans fil', category: 'extras_cotxe' },
  { key: 'connexio_a_internet', ca: 'Connexió a Internet', es: 'Conexión a Internet', en: 'Internet connection', fr: 'Connexion Internet', category: 'extras_cotxe' },
  { key: 'connexio_mp3_ipod', ca: 'Connexió MP3 -iPod', es: 'Conexión MP3 - iPod', en: 'MP3 - iPod connection', fr: 'Connexion MP3 - iPod', category: 'extras_cotxe' },
  { key: 'connexio_telefon', ca: 'Connexió telèfon', es: 'Conexión teléfono', en: 'Phone connection', fr: 'Connexion téléphone', category: 'extras_cotxe' },
  { key: 'control_per_canvi_de_carril', ca: 'Control per canvi de carril', es: 'Control cambio de carril', en: 'Lane change assist', fr: 'Aide changement de voie', category: 'extras_cotxe' },
  { key: 'control_clima_a_distancia', ca: 'Control clima a distància', es: 'Control climatización a distancia', en: 'Remote climate control', fr: 'Contrôle climatique à distance', category: 'extras_cotxe' },
  { key: 'control_descens', ca: 'Control descens', es: 'Control descenso', en: 'Hill descent control', fr: 'Contrôle de descente', category: 'extras_cotxe' },
  { key: 'control_estabilitat', ca: 'Control estabilitat', es: 'Control estabilidad', en: 'Stability control', fr: 'Contrôle de stabilité', category: 'extras_cotxe' },
  { key: 'control_pressio_pneumatics', ca: 'Control pressió pneumàtics', es: 'Control presión neumáticos', en: 'Tyre pressure monitoring', fr: 'Contrôle pression pneus', category: 'extras_cotxe' },
  { key: 'control_de_traccio', ca: 'Control de tracció', es: 'Control de tracción', en: 'Traction control', fr: 'Contrôle de traction', category: 'extras_cotxe' },
  { key: 'cruise_control', ca: 'Cruise control', es: 'Cruise control', en: 'Cruise control', fr: 'Cruise control', category: 'extras_cotxe' },
  { key: 'cruise_control_adaptatiu', ca: 'Cruise control adaptatiu', es: 'Cruise control adaptativo', en: 'Adaptive cruise control', fr: 'Cruise control adaptatif', category: 'extras_cotxe' },
  { key: 'deteccio_de_vianants_i_ciclistes', ca: 'Detecció de vianants i ciclistes', es: 'Detección de peatones y ciclistas', en: 'Pedestrian and cyclist detect.', fr: 'Détect. piétons et cyclistes', category: 'extras_cotxe' },
  { key: 'direccio_assistida', ca: 'Direcció assistida', es: 'Dirección asistida', en: 'Power steering', fr: 'Direction assistée', category: 'extras_cotxe' },
  { key: 'endoll_12v', ca: 'Endoll 12V', es: 'Toma 12V', en: '12V socket', fr: 'Prise 12V', category: 'extras_cotxe' },
  { key: 'endoll_220v', ca: 'Endoll 220V', es: 'Toma 220V', en: '220V socket', fr: 'Prise 220V', category: 'extras_cotxe' },
  { key: 'endoll_usb', ca: 'Endoll USB', es: 'Toma USB', en: 'USB socket', fr: 'Prise USB', category: 'extras_cotxe' },
  { key: 'equip_so_alta_fidelitat', ca: 'Equip so alta fidelitat', es: 'Equipo sonido HI-FI', en: 'HI-FI sound system', fr: 'Système audio HI-FI', category: 'extras_cotxe' },
  { key: 'fars_xeno', ca: 'Fars xenó', es: 'Faros xenon', en: 'Xenon headlights', fr: 'Phares xénon', category: 'extras_cotxe' },
  { key: 'fars_bi_xeno', ca: 'Fars bi-xenó', es: 'Faros bi-xenon', en: 'Bi-xenon headlights', fr: 'Phares bi-xénon', category: 'extras_cotxe' },
  { key: 'frenada_automatica_emergencia', ca: 'Frenada automàtica emergència', es: 'Frenada automática emergencia', en: 'Auto. emergency braking', fr: 'Freinage automat. urgence', category: 'extras_cotxe' },
  { key: 'gantxo_remolc', ca: 'Gantxo remolc', es: 'Gancho remolque', en: 'Tow hook', fr: 'Crochet remorquage', category: 'extras_cotxe' },
  { key: 'gantxo_remolc_retractil', ca: 'Gantxo remolc retràctil', es: 'Gancho remolque retráctil', en: 'Retractable tow hook', fr: 'Crochet remorq. escamotable', category: 'extras_cotxe' },
  { key: 'garantia_fabricant', ca: 'Garantia fabricant', es: 'Garantía fabricante', en: "Manufacturer's warranty", fr: 'Garantie constructeur', category: 'extras_cotxe' },
  { key: 'head_up_display', ca: 'Head Up Display', es: 'Head-Up Display', en: 'Head-Up Display', fr: 'Affichage tête haute', category: 'extras_cotxe' },
  { key: 'isofix', ca: 'Isofix', es: 'Isofix', en: 'Isofix', fr: 'Isofix', category: 'extras_cotxe' },
  { key: 'kit_carrosseria', ca: 'Kit carrosseria', es: 'Kit carrocería', en: 'Body kit', fr: 'Kit carrosserie', category: 'extras_cotxe' },
  { key: 'lector_senyals_de_transit', ca: 'Lector senyals de trànsit', es: 'Lector señales de tráfico', en: 'Traffic sign recognition', fr: 'Lecture panneaux signalisation', category: 'extras_cotxe' },
  { key: 'limitador_velocitat', ca: 'Limitador velocitat', es: 'Limitador velocidad', en: 'Speed limiter', fr: 'Limiteur vitesse', category: 'extras_cotxe' },
  { key: 'limitador_velocitat_adaptatiu', ca: 'Limitador velocitat adaptatiu', es: 'Limitador velocidad adaptativo', en: 'Adaptive speed limiter', fr: 'Limiteur vitesse adaptatif', category: 'extras_cotxe' },
  { key: 'llandes_aliatge', ca: "Llandes al·liatge", es: 'Llantas aleación', en: 'Alloy wheels', fr: 'Jantes alliage', category: 'extras_cotxe' },
  { key: 'llums_adaptatives', ca: 'Llums adaptatives', es: 'Luces adaptativas', en: 'Adaptive headlights', fr: 'Phares adaptatifs', category: 'extras_cotxe' },
  { key: 'llums_anti_boira', ca: 'Llums anti-boira', es: 'Luces antiniebla', en: 'Fog lights', fr: 'Phares antibrouillard', category: 'extras_cotxe' },
  { key: 'llums_de_dia', ca: 'Llums de dia', es: 'Luces diurnas', en: 'Daytime running lights', fr: 'Feux de jour', category: 'extras_cotxe' },
  { key: 'llums_led', ca: 'Llums LED', es: 'Luces LED', en: 'LED lights', fr: 'Feux LED', category: 'extras_cotxe' },
  { key: 'navegador_gps', ca: 'Navegador GPS', es: 'Navegador GPS', en: 'GPS navigation syst.', fr: 'GPS navigation', category: 'extras_cotxe' },
  { key: 'ordinador_de_bord', ca: 'Ordinador de bord', es: 'Ordenador de a bordo', en: 'On-board computer', fr: 'Ordinateur de bord', category: 'extras_cotxe' },
  { key: 'pintura_metalitzada', ca: 'Pintura metal·litzada', es: 'Pintura metalizada', en: 'Metallic paint', fr: 'Peinture métallisée', category: 'extras_cotxe' },
  { key: 'pneumatics_hivern', ca: 'Pneumàtics hivern', es: 'Neumáticos invierno', en: 'Winter tyres', fr: 'Pneus hiver', category: 'extras_cotxe' },
  { key: 'porto_electric', ca: 'Portó elèctric', es: 'Portón eléctrico', en: 'Electric tailgate', fr: 'Hayon électrique', category: 'extras_cotxe' },
  { key: 'radio_cd', ca: 'Ràdio-CD', es: 'Radio-CD', en: 'Radio-CD', fr: 'Radio-CD', category: 'extras_cotxe' },
  { key: 'reproductor_dvd', ca: 'Reproductor DVD', es: 'Reproductor DVD', en: 'DVD player', fr: 'Lecteur DVD', category: 'extras_cotxe' },
  { key: 'retrovisors_calefactables', ca: 'Retrovisors calefactables', es: 'Retrovisores calefactables', en: 'Heated mirrors', fr: 'Rétroviseurs chauffants', category: 'extras_cotxe' },
  { key: 'retrovisors_electrics', ca: 'Retrovisors elèctrics', es: 'Retrovisores eléctricos', en: 'Electric mirrors', fr: 'Rétroviseurs électriques', category: 'extras_cotxe' },
  { key: 'retrovisors_laterals_per_camera', ca: 'Retrovisors laterals per càmera', es: 'Retrovisores laterales cámara', en: 'Camera-based side mirrors', fr: 'Rétroviseurs latéraux caméra', category: 'extras_cotxe' },
  { key: 'retrovisor_interior_per_camera', ca: 'Retrovisor interior per càmera', es: 'Retrovisor interior cámara', en: 'Interior camera-based mirror', fr: 'Rétroviseur intérieur caméra', category: 'extras_cotxe' },
  { key: 'seients_calefactables', ca: 'Seients calefactables', es: 'Asientos calefactables', en: 'Heated seats', fr: 'Sièges chauffants', category: 'extras_cotxe' },
  { key: 'seients_electrics', ca: 'Seients elèctrics', es: 'Asientos eléctricos', en: 'Electric seats', fr: 'Sièges électriques', category: 'extras_cotxe' },
  { key: 'seients_esportius', ca: 'Seients esportius', es: 'Asientos Sport', en: 'Sport seats', fr: 'Sièges sport', category: 'extras_cotxe' },
  { key: 'seients_massatge', ca: 'Seients massatge', es: 'Asientos masaje', en: 'Massage seats', fr: 'Sièges massage', category: 'extras_cotxe' },
  { key: 'sensors_aparcament', ca: 'Sensors aparcament', es: 'Sensores aparcamiento', en: 'Parking sensors', fr: 'Capteurs stationnement', category: 'extras_cotxe' },
  { key: 'sensors_anti_collisio', ca: 'Sensors anti-col·lisió', es: 'Sensores anticolisión', en: 'Collision sensors', fr: 'Capteurs de collision', category: 'extras_cotxe' },
  { key: 'sensors_llums', ca: 'Sensors llums', es: 'Sensores luces', en: 'Light sensor', fr: 'Capteur de lumière', category: 'extras_cotxe' },
  { key: 'sensors_pluja', ca: 'Sensors pluja', es: 'Sensores lluvia', en: 'Rain sensor', fr: 'Capteur de pluie', category: 'extras_cotxe' },
  { key: 'sostre_obert', ca: 'Sostre obert', es: 'Techo corredizo', en: 'Sunroof', fr: 'Toit ouvrant', category: 'extras_cotxe' },
  { key: 'sostre_panoramic', ca: 'Sostre panoràmic', es: 'Techo panorámico', en: 'Panoramic roof', fr: 'Toit panoramique', category: 'extras_cotxe' },
  { key: 'start_stop', ca: 'Start-Stop', es: 'Start-Stop', en: 'Start-Stop', fr: 'Start-Stop', category: 'extras_cotxe' },
  { key: 'tanca_centralitzada', ca: 'Tanca centralitzada', es: 'Cierre centralizado', en: 'Central locking', fr: 'Fermeture centralisée', category: 'extras_cotxe' },
  { key: 'vidres_tintats', ca: 'Vidres tintats', es: 'Cristales tintados', en: 'Tinted windows', fr: 'Vitres teintées', category: 'extras_cotxe' },
  { key: 'vidres_electrics', ca: 'Vidres elèctrics', es: 'Cristales eléctricos', en: 'Electric windows', fr: 'Vitres électriques', category: 'extras_cotxe' },
  { key: 'visio_nocturna', ca: 'Visió nocturna', es: 'Visión nocturna', en: 'Night vision', fr: 'Vision nocturne', category: 'extras_cotxe' },
  { key: 'volant_calefactable', ca: 'Volant calefactable', es: 'Volante calefactable', en: 'Heated steering wheel', fr: 'Volant chauffant', category: 'extras_cotxe' },
  { key: 'volant_multifuncio', ca: 'Volant multifunció', es: 'Volante multifunción', en: 'Multif steering whe.', fr: 'Volant multifonction', category: 'extras_cotxe' },

  // EXTRES I COMPLEMENTS AUTOCARAVANA
  { key: 'aigua_corrent', ca: 'Aigua corrent', es: 'Agua corriente', en: 'Running water', fr: 'Eau courante', category: 'extras_autocaravana' },
  { key: 'antena_satellit', ca: 'Antena satel·lit', es: 'Antena parabólica', en: 'Satellite antenna', fr: 'Antenne satellite', category: 'extras_autocaravana' },
  { key: 'antena_tv', ca: 'Antena TV', es: 'Antena TV', en: 'TV antenna', fr: 'Antenne TV', category: 'extras_autocaravana' },
  { key: 'claraboies', ca: 'Claraboies', es: 'Claraboyas', en: 'Rooflights', fr: 'Lanternaux', category: 'extras_autocaravana' },
  { key: 'congelador', ca: 'Congelador', es: 'Congelador', en: 'Freezer', fr: 'Congélateur', category: 'extras_autocaravana' },
  { key: 'cuina', ca: 'Cuina', es: 'Cocina', en: 'Kitchen', fr: 'Cuisine', category: 'extras_autocaravana' },
  { key: 'detector_de_fums', ca: 'Detector de fums', es: 'Detector humo', en: 'Smoke detector', fr: 'Détecteur fumée', category: 'extras_autocaravana' },
  { key: 'dutxa', ca: 'Dutxa', es: 'Ducha', en: 'Shower', fr: 'Douche', category: 'extras_autocaravana' },
  { key: 'forn', ca: 'Forn', es: 'Horno', en: 'Oven', fr: 'Four', category: 'extras_autocaravana' },
  { key: 'frigorifc', ca: 'Frigorífic', es: 'Frigorífico', en: 'Fridge', fr: 'Réfrigérateur', category: 'extras_autocaravana' },
  { key: 'llits', ca: 'Llits', es: 'Camas', en: 'Beds', fr: 'Lits', category: 'extras_autocaravana' },
  { key: 'microones', ca: 'Microones', es: 'Microondas', en: 'Microwave', fr: 'Micro-ondes', category: 'extras_autocaravana' },
  { key: 'mosquitera', ca: 'Mosquitera', es: 'Mosquitera', en: 'Flyscreen', fr: 'Moustiquaire', category: 'extras_autocaravana' },
  { key: 'nevera', ca: 'Nevera', es: 'Nevera', en: 'Fridge', fr: 'Réfrigérateur', category: 'extras_autocaravana' },
  { key: 'tendall', ca: 'Tendall', es: 'Toldo', en: 'Awning', fr: 'Auvent', category: 'extras_autocaravana' },
  { key: 'tv', ca: 'TV', es: 'Televisión', en: 'Television', fr: 'Télévision', category: 'extras_autocaravana' },
  { key: 'wc', ca: 'WC', es: 'WC químico', en: 'Chemical toilet', fr: 'WC chimique', category: 'extras_autocaravana' },

  // EXTRES I COMPLEMENTS MOTOS
  { key: 'abs_moto', ca: 'ABS', es: 'ABS', en: 'ABS', fr: 'ABS', category: 'extras_moto' },
  { key: 'abs_en_corba', ca: 'ABS en corba', es: 'ABS en curva', en: 'Cornering ABS', fr: 'ABS en virage', category: 'extras_moto' },
  { key: 'alarma_moto', ca: 'Alarma', es: 'Alarma', en: 'Alarm', fr: 'Alarme', category: 'extras_moto' },
  { key: 'apple_carplay_android_auto_moto', ca: 'Apple Car Play / Android Auto', es: 'Apple CarPlay / Android Auto', en: 'Apple CarPlay / Android Auto', fr: 'Apple CarPlay / Android Auto', category: 'extras_moto' },
  { key: 'arrancada_sense_clau_moto', ca: 'Arrancada sense clau', es: 'Arranque sin llave', en: 'Keyless start', fr: 'Démarrage sans clé', category: 'extras_moto' },
  { key: 'bluetooth_moto', ca: 'Bluetooth', es: 'Bluetooth', en: 'Bluetooth', fr: 'Bluetooth', category: 'extras_moto' },
  { key: 'connexio_a_internet_moto', ca: 'Connexió a Internet', es: 'Conexión a Internet', en: 'Internet connection', fr: 'Connexion Internet', category: 'extras_moto' },
  { key: 'connexio_a_telefon_moto', ca: 'Connexió a telèfon', es: 'Conexión a teléfono', en: 'Phone connection', fr: 'Connexion téléphone', category: 'extras_moto' },
  { key: 'control_pressio_pneumatics_moto', ca: 'Control pressió pneumàtics', es: 'Control presión de neumát.', en: 'Tyre pressure monitoring', fr: 'Contrôle pression pneus', category: 'extras_moto' },
  { key: 'control_traccio_moto', ca: 'Control tracció', es: 'Control de tracción', en: 'Traction control', fr: 'Contrôle de traction', category: 'extras_moto' },
  { key: 'endoll_12v_moto', ca: 'Endoll 12V', es: 'Toma 12V', en: '12V socket', fr: 'Prise 12V', category: 'extras_moto' },
  { key: 'endoll_usb_moto', ca: 'Endoll USB', es: 'Toma USB', en: 'USB socket', fr: 'Prise USB', category: 'extras_moto' },
  { key: 'fars_led_moto', ca: 'Fars LED', es: 'Faros LED', en: 'LED headlights', fr: 'Phares LED', category: 'extras_moto' },
  { key: 'fars_xeno_moto', ca: 'Fars xenó', es: 'Faros xenón', en: 'Xenon headlights', fr: 'Phares xénon', category: 'extras_moto' },
  { key: 'fars_bi_xeno_moto', ca: 'Fars bi-xenó', es: 'Faros bi-xenón', en: 'Bi-xenon headlights', fr: 'Phares bi-xénon', category: 'extras_moto' },
  { key: 'garantia_fabricant_moto', ca: 'Garantia fabricant', es: 'Garantía fabricante', en: 'Manufact. warranty', fr: 'Garantie constructeur', category: 'extras_moto' },
  { key: 'gps_moto', ca: 'GPS', es: 'GPS', en: 'GPS', fr: 'GPS', category: 'extras_moto' },
  { key: 'keyless_moto', ca: 'Keyless', es: 'Keyless', en: 'Keyless', fr: 'Keyless', category: 'extras_moto' },
  { key: 'limitador_velocitat_moto', ca: 'Limitador velocitat', es: 'Limitador velocidad', en: 'Speed limiter', fr: 'Limiteur de vitesse', category: 'extras_moto' },
  { key: 'llandes_aliatge_moto', ca: "Llandes al·liatge", es: 'Llantas aleación', en: 'Alloy wheels', fr: 'Jantes en alliage', category: 'extras_moto' },
  { key: 'llums_de_dia_moto', ca: 'Llums de dia', es: 'Luces diurnas', en: 'Daytime run. lights', fr: 'Feux de jour', category: 'extras_moto' },
  { key: 'maletes_laterals', ca: 'Maletes laterals', es: 'Maletas laterales', en: 'Side cases', fr: 'Valises latérales', category: 'extras_moto' },
  { key: 'maleta_posterior', ca: 'Maleta posterior', es: 'Maleta trasera', en: 'Top case', fr: 'Top case', category: 'extras_moto' },
  { key: 'pantalla_regulable', ca: 'Pantalla regulable', es: 'Pantalla ajustable', en: 'Adjust. windscreen', fr: 'Bulle réglable', category: 'extras_moto' },
  { key: 'parabrises_frontal', ca: 'Parabrises frontal', es: 'Parabrisas delantero', en: 'Front windscreen', fr: 'Pare-brise avant', category: 'extras_moto' },
  { key: 'punys_calefactables', ca: 'Punys calefactables', es: 'Puños calefactables', en: 'Heated grips', fr: 'Poignées chauffantes', category: 'extras_moto' },
  { key: 'quick_shifter', ca: 'Quick Shifter', es: 'Quick Shifter', en: 'Quick Shifter', fr: 'Quick Shifter', category: 'extras_moto' },
  { key: 'seients_calefactables_moto', ca: 'Seients calefactables', es: 'Asientos calefactables', en: 'Heated seats', fr: 'Sièges chauffants', category: 'extras_moto' },
];

async function initializeVehicleExtrasTranslations() {
  console.log('🚀 Iniciando inserción de traducciones de extras de vehículos...');
  
  try {
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión establecida con la base de datos');

    // Contar traducciones existentes
    const existingCount = await prisma.vehicleTranslation.count();
    console.log(`📊 Traducciones existentes: ${existingCount}`);

    // Insertar todas las traducciones
    let insertedCount = 0;
    let skippedCount = 0;

    for (const translation of vehicleExtrasTranslations) {
      try {
        // Verificar si ya existe
        const existing = await prisma.vehicleTranslation.findUnique({
          where: { key: translation.key }
        });

        if (existing) {
          console.log(`⏭️  Omitiendo traducción existente: ${translation.key}`);
          skippedCount++;
          continue;
        }

        // Insertar nueva traducción
        await prisma.vehicleTranslation.create({
          data: translation
        });
        
        console.log(`✅ Insertada traducción: ${translation.key} (${translation.category})`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error al insertar ${translation.key}:`, error);
      }
    }

    // Resumen final
    const finalCount = await prisma.vehicleTranslation.count();
    console.log('\n📊 Resumen de la operación:');
    console.log(`   - Traducciones totales a insertar: ${vehicleExtrasTranslations.length}`);
    console.log(`   - Traducciones insertadas: ${insertedCount}`);
    console.log(`   - Traducciones omitidas (ya existían): ${skippedCount}`);
    console.log(`   - Total de traducciones en BD: ${finalCount}`);

    // Mostrar estadísticas por categoría
    const categoryCounts = await prisma.vehicleTranslation.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { category: 'asc' }
    });

    console.log('\n📈 Traducciones por categoría:');
    categoryCounts.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat._count}`);
    });

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initializeVehicleExtrasTranslations()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

export { initializeVehicleExtrasTranslations };