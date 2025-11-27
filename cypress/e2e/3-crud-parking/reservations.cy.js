describe('CRUD Reservations - Tests E2E', () => {
  const baseUrl = 'http://localhost:8080/api/reservations';
  const parkingsUrl = 'http://localhost:8080/api/parkings';
  let createdReservationId;

  // Avant chaque test, on s'assure que le serveur est accessible
  before(() => {
    cy.log('🚀 Vérification que le serveur est accessible...');
    cy.request('GET', baseUrl).its('status').should('eq', 200);
    cy.log('✅ Serveur accessible');
  });

  describe('READ - Récupération des réservations', () => {
    it('devrait récupérer toutes les réservations (GET /api/reservations)', () => {
      cy.request('GET', baseUrl)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.greaterThan(0);
          
          // Vérifier la structure d'une réservation
          const reservation = response.body[0];
          expect(reservation).to.have.property('id');
          expect(reservation).to.have.property('parkingId');
          expect(reservation).to.have.property('parking');
          expect(reservation).to.have.property('city');
          expect(reservation).to.have.property('clientName');
          expect(reservation).to.have.property('vehicle');
          expect(reservation).to.have.property('licensePlate');
          expect(reservation).to.have.property('checkin');
          expect(reservation).to.have.property('checkout');
          expect(reservation).to.have.property('ok');
        });
    });

    it('devrait récupérer les réservations d\'un parking spécifique (GET /api/reservations/parking/:id)', () => {
      const parkingId = 1;
      
      cy.request('GET', `${baseUrl}/parking/${parkingId}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          
          // Vérifier que toutes les réservations appartiennent au parking 1
          response.body.forEach(reservation => {
            expect(reservation.parkingId).to.eq(parkingId);
          });
        });
    });

    it('devrait récupérer une réservation spécifique (GET /api/reservations/parking/:id/:idreservation)', () => {
      const parkingId = 1;
      const reservationId = 1;
      
      cy.request('GET', `${baseUrl}/parking/${parkingId}/${reservationId}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
          expect(response.body.id).to.eq(reservationId);
          expect(response.body.parkingId).to.eq(parkingId);
          expect(response.body.clientName).to.eq('Thomas Martin');
          expect(response.body.vehicle).to.eq('car');
          expect(response.body.licensePlate).to.eq('ED432EF');
        });
    });

    it('devrait retourner 404 pour une réservation inexistante', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/parking/1/9999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Reservation not found');
      });
    });

    it('devrait retourner un tableau vide pour un parking sans réservations', () => {
      cy.request('GET', `${baseUrl}/parking/5`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
        });
    });
  });

  describe('CREATE - Création d\'une réservation', () => {
    it('devrait créer une nouvelle réservation pour un parking existant (POST /api/reservations/parking/:id)', () => {
      const parkingId = 1;
      
      // D'abord récupérer les infos actuelles du parking
      cy.request('GET', `${parkingsUrl}/${parkingId}`)
        .then((parkingResponse) => {
          const parking = parkingResponse.body;
          
          const newReservation = {
            id: 100,
            clientName: 'Jean Dupont',
            vehicle: 'car',
            licensePlate: 'AB123CD',
            checkin: '2025-12-01T08:00:00Z',
            checkout: '2025-12-05T18:00:00Z',
            ok: 1
          };

          cy.request('POST', `${baseUrl}/parking/${parkingId}`, newReservation)
            .then((response) => {
              expect(response.status).to.eq(201);
              expect(response.body).to.be.an('array');
              
              // Vérifier que la réservation a bien été ajoutée
              const addedReservation = response.body.find(r => r.id === 100);
              expect(addedReservation).to.exist;
              expect(addedReservation.clientName).to.eq('Jean Dupont');
              expect(addedReservation.parkingId).to.eq(parkingId);
              expect(addedReservation.parking).to.eq(parking.name); // Utiliser le nom actuel du parking
              expect(addedReservation.city).to.eq(parking.city); // Utiliser la ville actuelle
              expect(addedReservation.licensePlate).to.eq('AB123CD');
              
              createdReservationId = addedReservation.id;
            });
        });
    });

    it('devrait créer une réservation avec toutes les informations requises', () => {
      const parkingId = 2;
      
      // Récupérer les infos du parking 2
      cy.request('GET', `${parkingsUrl}/${parkingId}`)
        .then((parkingResponse) => {
          const parking = parkingResponse.body;
          
          const newReservation = {
            id: 101,
            clientName: 'Marie Curie',
            vehicle: 'motorcycle',
            licensePlate: 'MC456XY',
            checkin: '2025-12-10T09:00:00Z',
            checkout: '2025-12-15T17:00:00Z',
            ok: 1
          };

          cy.request('POST', `${baseUrl}/parking/${parkingId}`, newReservation)
            .then((response) => {
              expect(response.status).to.eq(201);
              
              // Vérifier en récupérant la réservation créée
              cy.request('GET', `${baseUrl}/parking/${parkingId}/101`)
                .then((getResponse) => {
                  expect(getResponse.status).to.eq(200);
                  expect(getResponse.body.clientName).to.eq('Marie Curie');
                  expect(getResponse.body.vehicle).to.eq('motorcycle');
                  expect(getResponse.body.parking).to.eq(parking.name); // Utiliser le nom actuel
                });
            });
        });
    });

    it('devrait retourner 404 lors de la création d\'une réservation pour un parking inexistant', () => {
      const newReservation = {
        id: 102,
        clientName: 'Pierre Dubois',
        vehicle: 'car',
        licensePlate: 'PD789ZZ',
        checkin: '2025-12-01T08:00:00Z',
        checkout: '2025-12-05T18:00:00Z',
        ok: 1
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/parking/9999`,
        body: newReservation,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Parking not found');
      });
    });
  });

  describe('UPDATE - Modification d\'une réservation', () => {
    it('devrait modifier une réservation existante (PUT /api/reservations/parking/:id/:idreservation)', () => {
      const parkingId = 1;
      const reservationId = 1;
      const updatedData = {
        id: 1,
        clientName: 'Thomas Martin - Modifié',
        vehicle: 'truck',
        licensePlate: 'ED432EF',
        checkin: '2025-08-21T06:00:00Z',
        checkout: '2025-08-30T06:00:00Z',
        ok: 0
      };

      cy.request('PUT', `${baseUrl}/parking/${parkingId}/${reservationId}`, updatedData)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          
          // Vérifier que la modification a été appliquée
          const updatedReservation = response.body.find(r => r.id === reservationId && r.parkingId === parkingId);
          expect(updatedReservation.clientName).to.eq('Thomas Martin - Modifié');
          expect(updatedReservation.vehicle).to.eq('truck');
          expect(updatedReservation.ok).to.eq(0);
        });

      // Vérifier que la modification est persistée
      cy.request('GET', `${baseUrl}/parking/${parkingId}/${reservationId}`)
        .then((response) => {
          expect(response.body.clientName).to.eq('Thomas Martin - Modifié');
          expect(response.body.vehicle).to.eq('truck');
        });
    });

    it('devrait retourner 404 lors de la modification d\'une réservation inexistante', () => {
      const updatedData = {
        id: 9999,
        clientName: 'Fantôme',
        vehicle: 'car',
        licensePlate: 'XX000XX',
        checkin: '2025-08-21T06:00:00Z',
        checkout: '2025-08-30T06:00:00Z',
        ok: 1
      };

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/parking/1/9999`,
        body: updatedData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Reservation not found');
      });
    });
  });

  describe('DELETE - Suppression d\'une réservation', () => {
    it('devrait supprimer une réservation existante (DELETE /api/reservations/parking/:id/:idreservation)', () => {
      const parkingId = 1;
      
      // Créer d'abord une réservation à supprimer
      const reservationToDelete = {
        id: 200,
        clientName: 'Réservation à Supprimer',
        vehicle: 'car',
        licensePlate: 'DELETE01',
        checkin: '2025-12-01T08:00:00Z',
        checkout: '2025-12-05T18:00:00Z',
        ok: 1
      };

      cy.request('POST', `${baseUrl}/parking/${parkingId}`, reservationToDelete)
        .then(() => {
          // Supprimer la réservation
          cy.request('DELETE', `${baseUrl}/parking/${parkingId}/200`)
            .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.be.an('array');
              
              // Vérifier que la réservation n'existe plus dans le tableau
              const deletedReservation = response.body.find(r => r.id === 200 && r.parkingId === parkingId);
              expect(deletedReservation).to.be.undefined;
            });

          // Vérifier que la réservation est bien supprimée
          cy.request({
            method: 'GET',
            url: `${baseUrl}/parking/${parkingId}/200`,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(404);
          });
        });
    });

    it('devrait retourner 404 lors de la suppression d\'une réservation inexistante', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/parking/1/9999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Reservation not found');
      });
    });
  });

  describe('CRUD Complet - Scénario de bout en bout pour les réservations', () => {
    it('devrait effectuer un cycle complet CRUD sur une réservation', () => {
      const parkingId = 3;
      const testReservationId = 300;
      
      // 1. CREATE - Créer une nouvelle réservation
      const newReservation = {
        id: testReservationId,
        clientName: 'Sophie Cycle Complet',
        vehicle: 'car',
        licensePlate: 'SC999CC',
        checkin: '2025-12-20T10:00:00Z',
        checkout: '2025-12-25T16:00:00Z',
        ok: 1
      };

      cy.request('POST', `${baseUrl}/parking/${parkingId}`, newReservation)
        .then((response) => {
          expect(response.status).to.eq(201);
          cy.log('✅ Réservation créée avec succès');
        });

      // 2. READ - Lire la réservation créée
      cy.request('GET', `${baseUrl}/parking/${parkingId}/${testReservationId}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.clientName).to.eq('Sophie Cycle Complet');
          expect(response.body.parkingId).to.eq(parkingId);
          cy.log('✅ Réservation récupérée avec succès');
        });

      // 3. UPDATE - Modifier la réservation
      const updatedReservation = {
        id: testReservationId,
        clientName: 'Sophie Cycle Complet - Modifiée',
        vehicle: 'van',
        licensePlate: 'SC999CC',
        checkin: '2025-12-21T10:00:00Z',
        checkout: '2025-12-26T16:00:00Z',
        ok: 0
      };

      cy.request('PUT', `${baseUrl}/parking/${parkingId}/${testReservationId}`, updatedReservation)
        .then((response) => {
          expect(response.status).to.eq(200);
          const updated = response.body.find(r => r.id === testReservationId && r.parkingId === parkingId);
          expect(updated.clientName).to.eq('Sophie Cycle Complet - Modifiée');
          expect(updated.vehicle).to.eq('van');
          cy.log('✅ Réservation modifiée avec succès');
        });

      // 4. DELETE - Supprimer la réservation
      cy.request('DELETE', `${baseUrl}/parking/${parkingId}/${testReservationId}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          cy.log('✅ Réservation supprimée avec succès');
        });

      // 5. Vérifier que la réservation n'existe plus
      cy.request({
        method: 'GET',
        url: `${baseUrl}/parking/${parkingId}/${testReservationId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        cy.log('✅ Confirmation: la réservation n\'existe plus');
      });
    });
  });

  describe('Tests de relations Parking-Réservation', () => {
    it('devrait vérifier qu\'une réservation hérite des informations du parking', () => {
      const parkingId = 4;
      
      // Récupérer d'abord les infos du parking
      cy.request('GET', `${parkingsUrl}/${parkingId}`)
        .then((parkingResponse) => {
          const parking = parkingResponse.body;
          
          // Créer une réservation pour ce parking
          const newReservation = {
            id: 400,
            clientName: 'Test Relation',
            vehicle: 'car',
            licensePlate: 'REL123',
            checkin: '2025-12-01T08:00:00Z',
            checkout: '2025-12-05T18:00:00Z',
            ok: 1
          };

          cy.request('POST', `${baseUrl}/parking/${parkingId}`, newReservation)
            .then((response) => {
              const createdReservation = response.body.find(r => r.id === 400);
              
              // Vérifier que la réservation a bien hérité des infos du parking
              expect(createdReservation.parkingId).to.eq(parking.id);
              expect(createdReservation.parking).to.eq(parking.name);
              expect(createdReservation.city).to.eq(parking.city);
              cy.log('✅ Relation Parking-Réservation vérifiée');
            });
        });
    });
  });
});