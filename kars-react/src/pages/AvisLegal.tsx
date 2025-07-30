import { useEffect } from "react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useLanguage } from "../context/LanguageContext";

export default function AvisLegal() {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const breadcrumbs = [
    { 
      label: { 
        ca: "Avís legal", 
        es: "Aviso legal", 
        en: "Legal notice", 
        fr: "Mentions légales" 
      }, 
      href: "/avis-legal" 
    }
  ];

  const getContent = () => {
    switch (currentLanguage) {
      case 'es':
        return {
          title: "Aviso Legal",
          content: `
            <h2>1. IDENTIFICACIÓN DE LA EMPRESA</h2>
            <p><strong>Razón Social:</strong> KARS Automòbils S.L.</p>
            <p><strong>Domicilio Social:</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principado de Andorra</p>
            <p><strong>Teléfono:</strong> +376 800 100</p>
            <p><strong>Email:</strong> info@kars.ad</p>
            <p><strong>NRT:</strong> A-700123</p>

            <h2>2. OBJETO</h2>
            <p>El presente aviso legal regula el uso del sitio web www.kars.ad (en adelante, "el sitio web"), del que es titular KARS Automòbils S.L.</p>
            <p>La navegación por el sitio web atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.</p>

            <h2>3. CONDICIONES DE USO</h2>
            <p>El sitio web y sus servicios son de acceso libre y gratuito. No obstante, KARS Automòbils se reserva el derecho a limitar, restringir o condicionar el acceso a la web, así como sus contenidos, sin previo aviso.</p>
            <p>El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que KARS Automòbils ofrece a través de su sitio web y con carácter enunciativo pero no limitativo:</p>
            <ul>
              <li>No emplear los contenidos y servicios ofrecidos para incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
              <li>No difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
              <li>No causar daños en los sistemas físicos y lógicos de KARS Automòbils, de sus proveedores o de terceras personas.</li>
            </ul>

            <h2>4. CONTENIDOS</h2>
            <p>Los contenidos del sitio web, como textos, fotografías, gráficos, imágenes, iconos, tecnología, software, así como su diseño gráfico y códigos fuente, constituyen una obra cuya propiedad pertenece a KARS Automòbils, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso del sitio web.</p>

            <h2>5. EXCLUSIÓN DE GARANTÍAS Y RESPONSABILIDAD</h2>
            <p>KARS Automòbils no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos.</p>

            <h2>6. MODIFICACIONES</h2>
            <p>KARS Automòbils se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.</p>

            <h2>7. ENLACES</h2>
            <p>En el caso de que en el sitio web se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet, KARS Automòbils no ejercerá ningún tipo de control sobre dichos sitios y contenidos.</p>

            <h2>8. DERECHO DE EXCLUSIÓN</h2>
            <p>KARS Automòbils se reserva el derecho a denegar o retirar el acceso a portal y/o los servicios ofrecidos sin previo aviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.</p>

            <h2>9. GENERALIDADES</h2>
            <p>KARS Automòbils perseguirá el incumplimiento de las presentes condiciones así como cualquier utilización indebida de su portal ejerciendo todas las acciones civiles y penales que le puedan corresponder en derecho.</p>

            <h2>10. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h2>
            <p>La relación entre KARS Automòbils y el usuario se regirá por la normativa andorrana vigente y cualquier controversia se someterá a los Juzgados y Tribunales del Principado de Andorra.</p>

            <p><em>Última actualización: Enero 2025</em></p>
          `
        };
      
      case 'en':
        return {
          title: "Legal Notice",
          content: `
            <h2>1. COMPANY IDENTIFICATION</h2>
            <p><strong>Company Name:</strong> KARS Automòbils S.L.</p>
            <p><strong>Registered Address:</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principality of Andorra</p>
            <p><strong>Phone:</strong> +376 800 100</p>
            <p><strong>Email:</strong> info@kars.ad</p>
            <p><strong>NRT:</strong> A-700123</p>

            <h2>2. PURPOSE</h2>
            <p>This legal notice governs the use of the website www.kars.ad (hereinafter, "the website"), owned by KARS Automòbils S.L.</p>
            <p>Browsing the website grants the user status and implies full and unreserved acceptance of each and every provision included in this Legal Notice.</p>

            <h2>3. CONDITIONS OF USE</h2>
            <p>The website and its services are freely accessible. However, KARS Automòbils reserves the right to limit, restrict or condition access to the web, as well as its contents, without prior notice.</p>
            <p>The user agrees to make appropriate use of the contents and services offered by KARS Automòbils through its website, including but not limited to:</p>
            <ul>
              <li>Not using the contents and services offered to engage in unlawful, illegal activities or those contrary to good faith and public order.</li>
              <li>Not disseminating content or propaganda of a racist, xenophobic, illegal-pornographic nature, in defense of terrorism or attacking human rights.</li>
              <li>Not causing damage to the physical and logical systems of KARS Automòbils, its suppliers or third parties.</li>
            </ul>

            <h2>4. CONTENTS</h2>
            <p>The contents of the website, such as texts, photographs, graphics, images, icons, technology, software, as well as its graphic design and source codes, constitute a work whose property belongs to KARS Automòbils, without any exploitation rights being understood as transferred to the user beyond what is strictly necessary for the correct use of the website.</p>

            <h2>5. EXCLUSION OF WARRANTIES AND LIABILITY</h2>
            <p>KARS Automòbils is not responsible, in any case, for damages of any nature that could be caused, including: errors or omissions in the contents, lack of availability of the portal or transmission of viruses or malicious or harmful programs in the contents.</p>

            <h2>6. MODIFICATIONS</h2>
            <p>KARS Automòbils reserves the right to make modifications it deems appropriate to its portal without prior notice, being able to change, delete or add both the contents and services provided through it as well as the way in which they appear presented or located on its portal.</p>

            <h2>7. LINKS</h2>
            <p>Should the website contain links or hyperlinks to other Internet sites, KARS Automòbils will not exercise any type of control over such sites and contents.</p>

            <h2>8. RIGHT OF EXCLUSION</h2>
            <p>KARS Automòbils reserves the right to deny or withdraw access to the portal and/or services offered without prior notice, on its own initiative or that of a third party, to those users who fail to comply with these General Conditions of Use.</p>

            <h2>9. GENERAL PROVISIONS</h2>
            <p>KARS Automòbils will pursue non-compliance with these conditions as well as any improper use of its portal by exercising all civil and criminal actions that may correspond to it by law.</p>

            <h2>10. APPLICABLE LAW AND JURISDICTION</h2>
            <p>The relationship between KARS Automòbils and the user will be governed by current Andorran regulations and any controversy will be submitted to the Courts and Tribunals of the Principality of Andorra.</p>

            <p><em>Last updated: January 2025</em></p>
          `
        };

      case 'fr':
        return {
          title: "Mentions Légales",
          content: `
            <h2>1. IDENTIFICATION DE L'ENTREPRISE</h2>
            <p><strong>Raison Sociale :</strong> KARS Automòbils S.L.</p>
            <p><strong>Siège Social :</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principauté d'Andorre</p>
            <p><strong>Téléphone :</strong> +376 800 100</p>
            <p><strong>Email :</strong> info@kars.ad</p>
            <p><strong>NRT :</strong> A-700123</p>

            <h2>2. OBJET</h2>
            <p>Les présentes mentions légales régissent l'utilisation du site web www.kars.ad (ci-après, "le site web"), dont KARS Automòbils S.L. est propriétaire.</p>
            <p>La navigation sur le site web attribue la qualité d'utilisateur et implique l'acceptation pleine et sans réserve de toutes les dispositions incluses dans ces Mentions Légales.</p>

            <h2>3. CONDITIONS D'UTILISATION</h2>
            <p>Le site web et ses services sont d'accès libre et gratuit. Néanmoins, KARS Automòbils se réserve le droit de limiter, restreindre ou conditionner l'accès au web, ainsi qu'à ses contenus, sans préavis.</p>
            <p>L'utilisateur s'engage à faire un usage approprié des contenus et services que KARS Automòbils offre à travers son site web, notamment :</p>
            <ul>
              <li>Ne pas utiliser les contenus et services offerts pour engager des activités illicites, illégales ou contraires à la bonne foi et à l'ordre public.</li>
              <li>Ne pas diffuser de contenus ou de propagande de caractère raciste, xénophobe, pornographique-illégal, d'apologie du terrorisme ou attentant aux droits de l'homme.</li>
              <li>Ne pas causer de dommages aux systèmes physiques et logiques de KARS Automòbils, de ses fournisseurs ou de tiers.</li>
            </ul>

            <h2>4. CONTENUS</h2>
            <p>Les contenus du site web, comme les textes, photographies, graphiques, images, icônes, technologie, logiciels, ainsi que son design graphique et codes sources, constituent une œuvre dont la propriété appartient à KARS Automòbils, sans qu'aucun droit d'exploitation ne soit entendu comme cédé à l'utilisateur au-delà de ce qui est strictement nécessaire pour l'usage correct du site web.</p>

            <h2>5. EXCLUSION DE GARANTIES ET RESPONSABILITÉ</h2>
            <p>KARS Automòbils ne se rend pas responsable, en aucun cas, des dommages de toute nature qui pourraient être occasionnés, à titre indicatif : erreurs ou omissions dans les contenus, manque de disponibilité du portail ou transmission de virus ou programmes malveillants ou nuisibles dans les contenus.</p>

            <h2>6. MODIFICATIONS</h2>
            <p>KARS Automòbils se réserve le droit d'effectuer sans préavis les modifications qu'elle juge opportunes sur son portail, pouvant changer, supprimer ou ajouter tant les contenus et services fournis que la façon dont ils apparaissent présentés ou localisés sur son portail.</p>

            <h2>7. LIENS</h2>
            <p>Dans le cas où le site web disposerait de liens ou hyperliens vers d'autres sites Internet, KARS Automòbils n'exercera aucun type de contrôle sur ces sites et contenus.</p>

            <h2>8. DROIT D'EXCLUSION</h2>
            <p>KARS Automòbils se réserve le droit de refuser ou retirer l'accès au portail et/ou aux services offerts sans préavis, de sa propre initiative ou à la demande d'un tiers, aux utilisateurs qui ne respectent pas ces Conditions Générales d'Utilisation.</p>

            <h2>9. DISPOSITIONS GÉNÉRALES</h2>
            <p>KARS Automòbils poursuivra le non-respect de ces conditions ainsi que toute utilisation abusive de son portail en exerçant toutes les actions civiles et pénales qui peuvent lui correspondre en droit.</p>

            <h2>10. LÉGISLATION APPLICABLE ET JURIDICTION</h2>
            <p>La relation entre KARS Automòbils et l'utilisateur sera régie par la réglementation andorrane en vigueur et toute controverse sera soumise aux Tribunaux de la Principauté d'Andorre.</p>

            <p><em>Dernière mise à jour : Janvier 2025</em></p>
          `
        };

      default: // ca
        return {
          title: "Avís Legal",
          content: `
            <h2>1. IDENTIFICACIÓ DE L'EMPRESA</h2>
            <p><strong>Raó Social:</strong> KARS Automòbils S.L.</p>
            <p><strong>Domicili Social:</strong> Carrer de la Unió, 10, AD500 Andorra la Vella, Principat d'Andorra</p>
            <p><strong>Telèfon:</strong> +376 800 100</p>
            <p><strong>Email:</strong> info@kars.ad</p>
            <p><strong>NRT:</strong> A-700123</p>

            <h2>2. OBJECTE</h2>
            <p>El present avís legal regula l'ús del lloc web www.kars.ad (d'ara endavant, "el lloc web"), del qual és titular KARS Automòbils S.L.</p>
            <p>La navegació pel lloc web atribueix la condició d'usuari del mateix i implica l'acceptació plena i sense reserves de totes i cadascuna de les disposicions incloses en aquest Avís Legal.</p>

            <h2>3. CONDICIONS D'ÚS</h2>
            <p>El lloc web i els seus serveis són d'accés lliure i gratuït. No obstant això, KARS Automòbils es reserva el dret a limitar, restringir o condicionar l'accés al web, així com els seus continguts, sense avís previ.</p>
            <p>L'usuari es compromet a fer un ús adequat dels continguts i serveis que KARS Automòbils ofereix a través del seu lloc web i amb caràcter enunciatiu però no limitatiu:</p>
            <ul>
              <li>No emprar els continguts i serveis oferits per incórrer en activitats il·lícites, il·legals o contràries a la bona fe i a l'ordre públic.</li>
              <li>No difondre continguts o propaganda de caràcter racista, xenòfob, pornogràfic-il·legal, d'apologia del terrorisme o atemptatòri contra els drets humans.</li>
              <li>No causar danys en els sistemes físics i lògics de KARS Automòbils, dels seus proveïdors o de terceres persones.</li>
            </ul>

            <h2>4. CONTINGUTS</h2>
            <p>Els continguts del lloc web, com textos, fotografies, gràfics, imatges, icones, tecnologia, programari, així com el seu disseny gràfic i codis font, constitueixen una obra la propietat de la qual pertany a KARS Automòbils, sense que puguin entendre's cedits a l'usuari cap dels drets d'explotació sobre els mateixos més enllà del que sigui estrictament necessari per al correcte ús del lloc web.</p>

            <h2>5. EXCLUSIÓ DE GARANTIES I RESPONSABILITAT</h2>
            <p>KARS Automòbils no es fa responsable, en cap cas, dels danys i perjudicis de qualsevol naturalesa que puguin ocasionar, a títol enunciatiu: errors o omissions en els continguts, falta de disponibilitat del portal o la transmissió de virus o programes maliciosos o lesius en els continguts.</p>

            <h2>6. MODIFICACIONS</h2>
            <p>KARS Automòbils es reserva el dret d'efectuar sense avís previ les modificacions que consideri oportunes en el seu portal, podent canviar, suprimir o afegir tant els continguts i serveis que es prestin a través de la mateixa com la forma en la qual aquests apareguin presentats o localitzats en el seu portal.</p>

            <h2>7. ENLLAÇOS</h2>
            <p>En el cas que en el lloc web es disposessin enllaços o hipervíncols cap a altres llocs d'Internet, KARS Automòbils no exercirà cap tipus de control sobre aquests llocs i continguts.</p>

            <h2>8. DRET D'EXCLUSIÓ</h2>
            <p>KARS Automòbils es reserva el dret a denegar o retirar l'accés a portal i/o els serveis oferits sense avís previ, a instància pròpia o d'un tercer, a aquells usuaris que incompleixin les presents Condicions Generals d'Ús.</p>

            <h2>9. GENERALITATS</h2>
            <p>KARS Automòbils perseguirà l'incompliment d'aquestes condicions així com qualsevol utilització indeguda del seu portal exercint totes les accions civils i penals que li puguin correspondre en dret.</p>

            <h2>10. LEGISLACIÓ APLICABLE I JURISDICCIÓ</h2>
            <p>La relació entre KARS Automòbils i l'usuari es regirà per la normativa andorrana vigent i qualsevol controvèrsia se sotmetrà als Jutjats i Tribunals del Principat d'Andorra.</p>

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