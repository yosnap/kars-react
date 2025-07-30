import { useEffect } from "react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useLanguage } from "../context/LanguageContext";

export default function PoliticaGaletes() {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const breadcrumbs = [
    { 
      label: { 
        ca: "Política de galetes", 
        es: "Política de cookies", 
        en: "Cookies policy", 
        fr: "Politique des cookies" 
      }, 
      href: "/politica-galetes" 
    }
  ];

  const getContent = () => {
    switch (currentLanguage) {
      case 'es':
        return {
          title: "Política de Cookies",
          content: `
            <h2>¿QUÉ SON LAS COOKIES?</h2>
            <p>Las cookies son pequeños archivos de datos que se almacenan en su dispositivo cuando visita un sitio web. Las cookies se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.</p>

            <h2>¿CÓMO UTILIZAMOS LAS COOKIES?</h2>
            <p>KARS Automòbils utiliza cookies para mejorar su experiencia de navegación y proporcionar funcionalidades personalizadas. Las utilizamos para:</p>
            <ul>
              <li>Recordar sus preferencias de idioma</li>
              <li>Mantener su sesión iniciada</li>
              <li>Recordar los vehículos que ha marcado como favoritos</li>
              <li>Analizar el tráfico del sitio web para mejorar nuestros servicios</li>
              <li>Personalizar el contenido según sus intereses</li>
            </ul>

            <h2>TIPOS DE COOKIES QUE UTILIZAMOS</h2>
            
            <h3>Cookies Estrictamente Necesarias</h3>
            <p>Estas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones. Sin estas cookies, no se pueden proporcionar servicios que haya solicitado, como acceder a áreas seguras del sitio web.</p>
            <ul>
              <li><strong>Cookies de sesión:</strong> Mantienen su sesión activa mientras navega</li>
              <li><strong>Cookies de preferencias:</strong> Recuerdan sus configuraciones de idioma</li>
              <li><strong>Cookies de seguridad:</strong> Ayudan a autenticar usuarios y prevenir el uso fraudulento</li>
            </ul>

            <h3>Cookies de Rendimiento</h3>
            <p>Estas cookies recopilan información sobre cómo los visitantes utilizan un sitio web, por ejemplo, qué páginas visitan más a menudo y si reciben mensajes de error de las páginas web.</p>
            <ul>
              <li><strong>Google Analytics:</strong> Analiza el comportamiento de los usuarios</li>
              <li><strong>Cookies de velocidad:</strong> Miden el rendimiento del sitio</li>
            </ul>

            <h3>Cookies de Funcionalidad</h3>
            <p>Estas cookies permiten al sitio web recordar las elecciones que hace (como su nombre de usuario, idioma o la región en la que se encuentra) y proporcionar características mejoradas y más personales.</p>
            <ul>
              <li><strong>Favoritos:</strong> Recuerdan los vehículos que ha guardado</li>
              <li><strong>Filtros de búsqueda:</strong> Mantienen sus preferencias de búsqueda</li>
            </ul>

            <h3>Cookies de Marketing/Publicidad</h3>
            <p>Estas cookies se utilizan para entregar anuncios más relevantes para usted y sus intereses. También se utilizan para limitar el número de veces que ve un anuncio.</p>

            <h2>COOKIES DE TERCEROS</h2>
            <p>Algunos de nuestros socios comerciales también pueden establecer cookies en su dispositivo cuando visita nuestro sitio. No tenemos control sobre estas cookies. Le sugerimos que consulte los sitios web de terceros para obtener más información sobre sus cookies y cómo gestionarlas.</p>

            <h2>CÓMO GESTIONAR LAS COOKIES</h2>
            <p>Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen.</p>

            <h3>Configuración del Navegador</h3>
            <p>La mayoría de los navegadores web le permiten controlar las cookies a través de su configuración. Para obtener más información sobre las cookies, incluido cómo ver qué cookies se han establecido y cómo gestionarlas y eliminarlas, visite:</p>
            <ul>
              <li><strong>Chrome:</strong> Configuración > Privacidad y seguridad > Cookies</li>
              <li><strong>Firefox:</strong> Opciones > Privacidad y Seguridad</li>
              <li><strong>Safari:</strong> Preferencias > Privacidad</li>
              <li><strong>Edge:</strong> Configuración > Cookies y permisos del sitio</li>
            </ul>

            <h2>CONSENTIMIENTO</h2>
            <p>Al utilizar nuestro sitio web, usted consiente el uso de cookies de acuerdo con esta Política de Cookies. Si no acepta el uso de estas cookies, debe configurar su navegador en consecuencia o abstenerse de utilizar nuestro sitio.</p>

            <h2>CAMBIOS EN ESTA POLÍTICA</h2>
            <p>Podemos actualizar esta Política de Cookies de vez en cuando para reflejar cambios en las cookies que utilizamos o por otras razones operativas, legales o reglamentarias. Por favor, revise esta Política de Cookies regularmente para mantenerse informado sobre nuestro uso de cookies y tecnologías relacionadas.</p>

            <h2>CONTACTO</h2>
            <p>Si tiene alguna pregunta sobre esta Política de Cookies, póngase en contacto con nosotros en:</p>
            <p><strong>Email:</strong> info@kars.ad<br>
            <strong>Teléfono:</strong> +376 800 100<br>
            <strong>Dirección:</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principado de Andorra</p>

            <p><em>Última actualización: Enero 2025</em></p>
          `
        };
      
      case 'en':
        return {
          title: "Cookies Policy",
          content: `
            <h2>WHAT ARE COOKIES?</h2>
            <p>Cookies are small data files that are stored on your device when you visit a website. Cookies are widely used to make websites work, or work more efficiently, as well as to provide information to website owners.</p>

            <h2>HOW DO WE USE COOKIES?</h2>
            <p>KARS Automòbils uses cookies to improve your browsing experience and provide personalized functionality. We use them to:</p>
            <ul>
              <li>Remember your language preferences</li>
              <li>Keep you logged in</li>
              <li>Remember vehicles you've marked as favorites</li>
              <li>Analyze website traffic to improve our services</li>
              <li>Personalize content according to your interests</li>
            </ul>

            <h2>TYPES OF COOKIES WE USE</h2>
            
            <h3>Strictly Necessary Cookies</h3>
            <p>These cookies are essential for you to browse the website and use its features. Without these cookies, services you have asked for cannot be provided, such as accessing secure areas of the website.</p>
            <ul>
              <li><strong>Session cookies:</strong> Keep your session active while browsing</li>
              <li><strong>Preference cookies:</strong> Remember your language settings</li>
              <li><strong>Security cookies:</strong> Help authenticate users and prevent fraudulent use</li>
            </ul>

            <h3>Performance Cookies</h3>
            <p>These cookies collect information about how visitors use a website, for instance which pages visitors go to most often, and if they get error messages from web pages.</p>
            <ul>
              <li><strong>Google Analytics:</strong> Analyzes user behavior</li>
              <li><strong>Speed cookies:</strong> Measure site performance</li>
            </ul>

            <h3>Functionality Cookies</h3>
            <p>These cookies allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features.</p>
            <ul>
              <li><strong>Favorites:</strong> Remember vehicles you've saved</li>
              <li><strong>Search filters:</strong> Maintain your search preferences</li>
            </ul>

            <h3>Marketing/Advertising Cookies</h3>
            <p>These cookies are used to deliver adverts more relevant to you and your interests. They are also used to limit the number of times you see an advertisement.</p>

            <h2>THIRD-PARTY COOKIES</h2>
            <p>Some of our business partners may also set cookies on your device when you visit our site. We have no control over these cookies. We suggest you check third-party websites for more information about their cookies and how to manage them.</p>

            <h2>HOW TO MANAGE COOKIES</h2>
            <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>

            <h3>Browser Settings</h3>
            <p>Most web browsers allow you to control cookies through their settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit:</p>
            <ul>
              <li><strong>Chrome:</strong> Settings > Privacy and security > Cookies</li>
              <li><strong>Firefox:</strong> Options > Privacy & Security</li>
              <li><strong>Safari:</strong> Preferences > Privacy</li>
              <li><strong>Edge:</strong> Settings > Cookies and site permissions</li>
            </ul>

            <h2>CONSENT</h2>
            <p>By using our website, you consent to the use of cookies in accordance with this Cookie Policy. If you do not accept the use of these cookies, please set your browser accordingly or refrain from using our site.</p>

            <h2>CHANGES TO THIS POLICY</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>

            <h2>CONTACT</h2>
            <p>If you have any questions about this Cookie Policy, please contact us at:</p>
            <p><strong>Email:</strong> info@kars.ad<br>
            <strong>Phone:</strong> +376 800 100<br>
            <strong>Address:</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principality of Andorra</p>

            <p><em>Last updated: January 2025</em></p>
          `
        };

      case 'fr':
        return {
          title: "Politique des Cookies",
          content: `
            <h2>QUE SONT LES COOKIES ?</h2>
            <p>Les cookies sont de petits fichiers de données qui sont stockés sur votre appareil lorsque vous visitez un site web. Les cookies sont largement utilisés pour faire fonctionner les sites web, ou les faire fonctionner plus efficacement, ainsi que pour fournir des informations aux propriétaires du site.</p>

            <h2>COMMENT UTILISONS-NOUS LES COOKIES ?</h2>
            <p>KARS Automòbils utilise des cookies pour améliorer votre expérience de navigation et fournir des fonctionnalités personnalisées. Nous les utilisons pour :</p>
            <ul>
              <li>Mémoriser vos préférences de langue</li>
              <li>Vous maintenir connecté</li>
              <li>Mémoriser les véhicules que vous avez marqués comme favoris</li>
              <li>Analyser le trafic du site web pour améliorer nos services</li>
              <li>Personnaliser le contenu selon vos intérêts</li>
            </ul>

            <h2>TYPES DE COOKIES QUE NOUS UTILISONS</h2>
            
            <h3>Cookies Strictement Nécessaires</h3>
            <p>Ces cookies sont essentiels pour que vous puissiez naviguer sur le site web et utiliser ses fonctionnalités. Sans ces cookies, les services que vous avez demandés ne peuvent pas être fournis, comme l'accès aux zones sécurisées du site web.</p>
            <ul>
              <li><strong>Cookies de session :</strong> Maintiennent votre session active pendant la navigation</li>
              <li><strong>Cookies de préférences :</strong> Mémorisent vos paramètres de langue</li>
              <li><strong>Cookies de sécurité :</strong> Aident à authentifier les utilisateurs et prévenir l'usage frauduleux</li>
            </ul>

            <h3>Cookies de Performance</h3>
            <p>Ces cookies collectent des informations sur la façon dont les visiteurs utilisent un site web, par exemple quelles pages les visiteurs consultent le plus souvent, et s'ils reçoivent des messages d'erreur des pages web.</p>
            <ul>
              <li><strong>Google Analytics :</strong> Analyse le comportement des utilisateurs</li>
              <li><strong>Cookies de vitesse :</strong> Mesurent les performances du site</li>
            </ul>

            <h3>Cookies de Fonctionnalité</h3>
            <p>Ces cookies permettent au site web de mémoriser les choix que vous faites (comme votre nom d'utilisateur, langue, ou la région dans laquelle vous vous trouvez) et de fournir des fonctionnalités améliorées et plus personnelles.</p>
            <ul>
              <li><strong>Favoris :</strong> Mémorisent les véhicules que vous avez sauvegardés</li>
              <li><strong>Filtres de recherche :</strong> Maintiennent vos préférences de recherche</li>
            </ul>

            <h3>Cookies de Marketing/Publicité</h3>
            <p>Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous et vos intérêts. Ils sont également utilisés pour limiter le nombre de fois que vous voyez une publicité.</p>

            <h2>COOKIES DE TIERS</h2>
            <p>Certains de nos partenaires commerciaux peuvent également définir des cookies sur votre appareil lorsque vous visitez notre site. Nous n'avons aucun contrôle sur ces cookies. Nous vous suggérons de consulter les sites web de tiers pour plus d'informations sur leurs cookies et comment les gérer.</p>

            <h2>COMMENT GÉRER LES COOKIES</h2>
            <p>Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Vous pouvez supprimer tous les cookies qui sont déjà sur votre ordinateur et vous pouvez configurer la plupart des navigateurs pour empêcher qu'ils soient placés.</p>

            <h3>Paramètres du Navigateur</h3>
            <p>La plupart des navigateurs web vous permettent de contrôler les cookies via leurs paramètres. Pour en savoir plus sur les cookies, y compris comment voir quels cookies ont été définis et comment les gérer et les supprimer, visitez :</p>
            <ul>
              <li><strong>Chrome :</strong> Paramètres > Confidentialité et sécurité > Cookies</li>
              <li><strong>Firefox :</strong> Options > Vie privée et Sécurité</li>
              <li><strong>Safari :</strong> Préférences > Confidentialité</li>
              <li><strong>Edge :</strong> Paramètres > Cookies et autorisations de site</li>
            </ul>

            <h2>CONSENTEMENT</h2>
            <p>En utilisant notre site web, vous consentez à l'utilisation de cookies conformément à cette Politique des Cookies. Si vous n'acceptez pas l'utilisation de ces cookies, veuillez configurer votre navigateur en conséquence ou vous abstenir d'utiliser notre site.</p>

            <h2>MODIFICATIONS DE CETTE POLITIQUE</h2>
            <p>Nous pouvons mettre à jour cette Politique des Cookies de temps à autre pour refléter les changements dans les cookies que nous utilisons ou pour d'autres raisons opérationnelles, légales ou réglementaires. Veuillez revoir cette Politique des Cookies régulièrement pour rester informé de notre utilisation des cookies et des technologies connexes.</p>

            <h2>CONTACT</h2>
            <p>Si vous avez des questions sur cette Politique des Cookies, veuillez nous contacter à :</p>
            <p><strong>Email :</strong> info@kars.ad<br>
            <strong>Téléphone :</strong> +376 800 100<br>
            <strong>Adresse :</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principauté d'Andorre</p>

            <p><em>Dernière mise à jour : Janvier 2025</em></p>
          `
        };

      default: // ca
        return {
          title: "Política de Galetes",
          content: `
            <h2>QUÈ SÓN LES GALETES?</h2>
            <p>Les galetes són petits fitxers de dades que s'emmagatzemen al vostre dispositiu quan visiteu un lloc web. Les galetes s'utilitzen àmpliament per fer que els llocs web funcionin, o funcionin de manera més eficient, així com per proporcionar informació als propietaris del lloc.</p>

            <h2>COM UTILITZEM LES GALETES?</h2>
            <p>KARS Automòbils utilitza galetes per millorar la vostra experiència de navegació i proporcionar funcionalitats personalitzades. Les utilitzem per:</p>
            <ul>
              <li>Recordar les vostres preferències d'idioma</li>
              <li>Mantenir la vostra sessió iniciada</li>
              <li>Recordar els vehicles que heu marcat com a favorits</li>
              <li>Analitzar el trànsit del lloc web per millorar els nostres serveis</li>
              <li>Personalitzar el contingut segons els vostres interessos</li>
            </ul>

            <h2>TIPUS DE GALETES QUE UTILITZEM</h2>
            
            <h3>Galetes Estrictament Necessàries</h3>
            <p>Aquestes galetes són essencials perquè pugueu navegar pel lloc web i utilitzar les seves funcions. Sense aquestes galetes, no es poden proporcionar serveis que hàgiu sol·licitat, com accedir a àrees segures del lloc web.</p>
            <ul>
              <li><strong>Galetes de sessió:</strong> Mantenen la vostra sessió activa mentre navegueu</li>
              <li><strong>Galetes de preferències:</strong> Recorden les vostres configuracions d'idioma</li>
              <li><strong>Galetes de seguretat:</strong> Ajuden a autenticar usuaris i prevenir l'ús fraudulent</li>
            </ul>

            <h3>Galetes de Rendiment</h3>
            <p>Aquestes galetes recullen informació sobre com els visitants utilitzen un lloc web, per exemple, quines pàgines visiten més sovint i si reben missatges d'error de les pàgines web.</p>
            <ul>
              <li><strong>Google Analytics:</strong> Analitza el comportament dels usuaris</li>
              <li><strong>Galetes de velocitat:</strong> Mesuren el rendiment del lloc</li>
            </ul>

            <h3>Galetes de Funcionalitat</h3>
            <p>Aquestes galetes permeten al lloc web recordar les eleccions que feu (com el vostre nom d'usuari, idioma o la regió en què us trobeu) i proporcionar característiques millorades i més personals.</p>
            <ul>
              <li><strong>Favorits:</strong> Recorden els vehicles que heu desat</li>
              <li><strong>Filtres de cerca:</strong> Mantenen les vostres preferències de cerca</li>
            </ul>

            <h3>Galetes de Màrqueting/Publicitat</h3>
            <p>Aquestes galetes s'utilitzen per lliurar anuncis més rellevants per a vosaltres i els vostres interessos. També s'utilitzen per limitar el nombre de vegades que veieu un anunci.</p>

            <h2>GALETES DE TERCERS</h2>
            <p>Alguns dels nostres socis comercials també poden establir galetes al vostre dispositiu quan visiteu el nostre lloc. No tenim control sobre aquestes galetes. Us suggerim que consulteu els llocs web de tercers per obtenir més informació sobre les seves galetes i com gestionar-les.</p>

            <h2>COM GESTIONAR LES GALETES</h2>
            <p>Podeu controlar i/o eliminar les galetes com vulgueu. Podeu eliminar totes les galetes que ja estan al vostre ordinador i podeu configurar la majoria dels navegadors per evitar que es col·loquin.</p>

            <h3>Configuració del Navegador</h3>
            <p>La majoria dels navegadors web us permeten controlar les galetes a través de la seva configuració. Per obtenir més informació sobre les galetes, incloent com veure quines galetes s'han establert i com gestionar-les i eliminar-les, visiteu:</p>
            <ul>
              <li><strong>Chrome:</strong> Configuració > Privacitat i seguretat > Galetes</li>
              <li><strong>Firefox:</strong> Opcions > Privacitat i Seguretat</li>
              <li><strong>Safari:</strong> Preferències > Privacitat</li>
              <li><strong>Edge:</strong> Configuració > Galetes i permisos del lloc</li>
            </ul>

            <h2>CONSENTIMENT</h2>
            <p>En utilitzar el nostre lloc web, consentiu l'ús de galetes d'acord amb aquesta Política de Galetes. Si no accepteu l'ús d'aquestes galetes, heu de configurar el vostre navegador en conseqüència o abstenir-vos d'utilitzar el nostre lloc.</p>

            <h2>CANVIS EN AQUESTA POLÍTICA</h2>
            <p>Podem actualitzar aquesta Política de Galetes de tant en tant per reflectir canvis en les galetes que utilitzem o per altres raons operatives, legals o reglamentàries. Si us plau, reviseu aquesta Política de Galetes regularment per mantenir-vos informats sobre el nostre ús de galetes i tecnologies relacionades.</p>

            <h2>CONTACTE</h2>
            <p>Si teniu alguna pregunta sobre aquesta Política de Galetes, poseu-vos en contacte amb nosaltres a:</p>
            <p><strong>Email:</strong> info@kars.ad<br>
            <strong>Telèfon:</strong> +376 800 100<br>
            <strong>Adreça:</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principat d'Andorra</p>

            <p><em>Última actualització: Gener 2025</em></p>
          `
        };
    }
  };

  const { title, content } = getContent();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>

        {/* Título principal */}
        <h1 className="text-5xl font-bold text-red-500 mb-8 text-center">{title}</h1>
        
        {/* Contenido legal */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="text-white"
            style={{
              lineHeight: '1.8',
            }}
          >
            <style>{`
              .legal-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 2rem;
                margin-bottom: 1rem;
                color: #ef4444;
                display: flex;
                align-items: center;
              }
              .legal-content h2::before {
                content: '›';
                color: #ef4444;
                margin-right: 0.5rem;
              }
              .legal-content h3 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: #f3f4f6;
              }
              .legal-content p {
                margin-bottom: 1rem;
                color: #e5e7eb;
              }
              .legal-content ul {
                margin-bottom: 1rem;
                padding-left: 1.5rem;
                list-style-type: disc;
              }
              .legal-content li {
                margin-bottom: 0.5rem;
                color: #e5e7eb;
              }
              .legal-content strong {
                font-weight: 600;
                color: #f9fafb;
              }
              .legal-content em {
                font-style: italic;
                color: #9ca3af;
                font-size: 0.875rem;
              }
            `}</style>
            <div 
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}