<script setup>

</script>

<template>
  <main>
    <div class="wrapper">
      <div class="title">
        <h1>Kontakt</h1>
      </div>
      <div class="header">
        <img src="../../assets/img/logo.png" alt="logo">
        <span class="name">Screenix Łódź</span>
      </div>
      <div class="description">
        <div class="text">
          Kino Screenix zlokalizowane jest w Manufakturze w Łodzi. Posiada 10 klimatyzowanych sal wyposażonych w wysokiej klasy sprzęt nagłaśniający, dźwięk cyfrowy <b style="font-weight: 500">Dolby ATMOS</b> oraz <b style="font-weight: 500">DOLBY 7.1</b>, a także srebrne ekrany najwyższej światowej jakości 4K. Wyróżniające się nowoczesnym designem, wyposażone w wygodne, skórzane fotele z regulacją siedzeń, system dźwięku Dolby Atmos i obraz w rozdzielczości 4K sale, wyznaczają nowe standardy odbioru filmu w kinie.
          Poza regularnym repertuarem, w którym prezentowane są największe hity światowej kinematografii, Screenix oferuje Widzom także seanse specjalne takie jak: Nocne Maratony Filmowe i Screenix dla Dzieci.
          <br><br>
          W kinie funkcjonuje także Screenix Café, w której można napić się aromatycznej kawy w wielu smakach oraz bar kinowy, który oferuje Widzom świeży popcorn, napoje oraz duży wybór słodyczy.
        </div>
        <img src="../../assets/img/cinema_art.jpg" alt="cinemaArt">
      </div>
      <hr>
      <span class="text">dane kontaktowe:</span>
      <div class="contact">
        <img src="../../assets/img/location.svg" alt="locationIcon">
        adres: ul. Drewnowska 58 (CH Manufaktura Łódź)
      </div>
      <div class="contact">
        <img src="../../assets/img/phone.svg" alt="phoneIcon">
        telefon: 873643827
      </div>
      <div class="contact">
        <img src="../../assets/img/mail.svg" alt="mailIcon">
        e-mail: screenixcinema@gmail.com
      </div>
    </div>
  </main>
</template>

<style scoped>
main .wrapper {
  padding-inline: 1rem;
  width: clamp(300px, 100%, 1370px);
  margin-inline: auto;
}

main .title {
  padding-top: 45px;
}

main .title h1 {
  font-weight: 500;
  font-size: 2.3rem;
}

.header{
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.header img{
  width: 40px;
  filter: invert(9%) sepia(82%) saturate(3259%) hue-rotate(260deg) brightness(119%) contrast(100%);
}
 .header .name{
   font-weight: 600;
   margin-left: 10px;
 }
 .text{
   font-size: 18px;
   max-width: 750px;
   text-align: justify;
   line-height: 30px;
 }

 .description{
   display: flex;
   justify-content: space-between;
 }

 .description .text{
   margin-bottom: 30px;
 }

 .description img{
   width: 450px;
   margin-left: 20px;
 }
 .contact{
   display: flex;
   align-items: center;
   margin-top: 12px;
   margin-bottom: 12px;
   font-size: 18px;
 }
 .contact img{
   margin-right: 12px;
   width: 25px;
   filter: invert(9%) sepia(82%) saturate(3259%) hue-rotate(260deg) brightness(119%) contrast(100%);

 }
hr {
  border: 0.5px solid #686868;
  margin: 30px 0;
}

@media only screen and (max-width: 1050px) {
  .description{
    display: block;
    padding: 10px 5px;
  }
  .description img{
    margin: auto;
  }
}


</style>