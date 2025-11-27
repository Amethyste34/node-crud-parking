describe('CRUD Parkings - Tests E2E', () => {
  const baseUrl = 'http://localhost:8080/api/parkings';
  let createdParkingId;

  // Avant chaque test, on s'assure que le serveur est accessible
  beforeEach(() => {
    cy.request('GET', baseUrl).its('status').should('eq', 200);
  });

  describe('READ - Récupération des parkings', () => {
    it('devrait récupérer tous les parkings (GET /api/parkings)', () => {
      cy.request('GET', baseUrl)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.greaterThan(0);
          
          // Vérifier la structure d'un parking
          const parking = response.body[0];
          expect(parking).to.have.property('id');
          expect(parking).to.have.property('name');
          expect(parking).to.have.property('type');
          expect(parking).to.have.property('city');
        });
    });

    it('devrait récupérer un parking par son ID (GET /api/parkings/:id)', () => {
      cy.request('GET', `${baseUrl}/1`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
          expect(response.body.id).to.eq(1);
          expect(response.body).to.have.property('name');
          expect(response.body).to.have.property('type');
          expect(response.body).to.have.property('city');
        });
    });

    it('devrait retourner 404 pour un parking inexistant (GET /api/parkings/:id)', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/9999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Parking not found');
      });
    });
  });

  describe('CREATE - Création d\'un parking', () => {
    it('devrait créer un nouveau parking (POST /api/parkings)', () => {
      const newParking = {
        id: 100,
        name: 'Parking Test Cypress',
        type: 'AIRPORT',
        city: 'BORDEAUX'
      };

      cy.request('POST', baseUrl, newParking)
        .then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.be.an('array');
          
          // Vérifier que le parking a bien été ajouté
          const addedParking = response.body.find(p => p.id === 100);
          expect(addedParking).to.exist;
          expect(addedParking.name).to.eq('Parking Test Cypress');
          expect(addedParking.type).to.eq('AIRPORT');
          expect(addedParking.city).to.eq('BORDEAUX');
          
          createdParkingId = addedParking.id;
        });
    });

    it('devrait créer un parking avec tous les champs requis', () => {
      const newParking = {
        id: 101,
        name: 'Parking Test 2',
        type: 'CITY_CENTER',
        city: 'MARSEILLE'
      };

      cy.request('POST', baseUrl, newParking)
        .then((response) => {
          expect(response.status).to.eq(201);
          
          // Vérifier en récupérant le parking créé
          cy.request('GET', `${baseUrl}/101`)
            .then((getResponse) => {
              expect(getResponse.status).to.eq(200);
              expect(getResponse.body.name).to.eq('Parking Test 2');
            });
        });
    });
  });

  describe('UPDATE - Modification d\'un parking', () => {
    it('devrait modifier un parking existant (PUT /api/parkings/:id)', () => {
      const updatedData = {
        name: 'Parking 1 Modifié',
        type: 'CITY_CENTER',
        city: 'PARIS CDG'
      };

      cy.request('PUT', `${baseUrl}/1`, updatedData)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
          expect(response.body.id).to.eq(1);
          expect(response.body.name).to.eq('Parking 1 Modifié');
          expect(response.body.type).to.eq('CITY_CENTER');
          expect(response.body.city).to.eq('PARIS CDG');
        });

      // Vérifier que la modification a bien été appliquée
      cy.request('GET', `${baseUrl}/1`)
        .then((response) => {
          expect(response.body.name).to.eq('Parking 1 Modifié');
          expect(response.body.city).to.eq('PARIS CDG');
        });
    });

    it('devrait retourner 404 lors de la modification d\'un parking inexistant', () => {
      const updatedData = {
        name: 'Parking Inexistant',
        type: 'AIRPORT',
        city: 'NOWHERE'
      };

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/9999`,
        body: updatedData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Parking not found');
      });
    });
  });

  describe('DELETE - Suppression d\'un parking', () => {
    it('devrait supprimer un parking existant (DELETE /api/parkings/:id)', () => {
      // Créer d'abord un parking à supprimer
      const parkingToDelete = {
        id: 200,
        name: 'Parking à Supprimer',
        type: 'AIRPORT',
        city: 'LYON'
      };

      cy.request('POST', baseUrl, parkingToDelete)
        .then(() => {
          // Supprimer le parking
          cy.request('DELETE', `${baseUrl}/200`)
            .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.be.an('array');
              
              // Vérifier que le parking n'existe plus
              const deletedParking = response.body.find(p => p.id === 200);
              expect(deletedParking).to.be.undefined;
            });

          // Vérifier que le parking est bien supprimé en essayant de le récupérer
          cy.request({
            method: 'GET',
            url: `${baseUrl}/200`,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(404);
          });
        });
    });

    it('devrait retourner 404 lors de la suppression d\'un parking inexistant', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/9999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Parking not found');
      });
    });
  });

  describe('CRUD Complet - Scénario de bout en bout', () => {
    it('devrait effectuer un cycle complet CRUD sur un parking', () => {
      const testParkingId = 300;
      
      // 1. CREATE - Créer un nouveau parking
      const newParking = {
        id: testParkingId,
        name: 'Parking Cycle Complet',
        type: 'AIRPORT',
        city: 'TOULOUSE'
      };

      cy.request('POST', baseUrl, newParking)
        .then((response) => {
          expect(response.status).to.eq(201);
          cy.log('✅ Parking créé avec succès');
        });

      // 2. READ - Lire le parking créé
      cy.request('GET', `${baseUrl}/${testParkingId}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.name).to.eq('Parking Cycle Complet');
          cy.log('✅ Parking récupéré avec succès');
        });

      // 3. UPDATE - Modifier le parking
      const updatedParking = {
        name: 'Parking Cycle Complet - Modifié',
        type: 'CITY_CENTER',
        city: 'TOULOUSE BLAGNAC'
      };

      cy.request('PUT', `${baseUrl}/${testParkingId}`, updatedParking)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.name).to.eq('Parking Cycle Complet - Modifié');
          cy.log('✅ Parking modifié avec succès');
        });

      // 4. DELETE - Supprimer le parking
      cy.request('DELETE', `${baseUrl}/${testParkingId}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          cy.log('✅ Parking supprimé avec succès');
        });

      // 5. Vérifier que le parking n'existe plus
      cy.request({
        method: 'GET',
        url: `${baseUrl}/${testParkingId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        cy.log('✅ Confirmation: le parking n\'existe plus');
      });
    });
  });
});