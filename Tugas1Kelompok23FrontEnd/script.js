function konversi() {
    // Ambil nilai input dari HTML
    let angka = document.getElementById("angka").value;
    let dari = document.getElementById("dari").value;
    let ke = document.getElementById("ke").value;
    let meter;

    // Ubah semua input ke dalam satuan "meter" dulu
    if (dari == "m") meter = angka;
    else if (dari == "cm") meter = angka / 100;
    else if (dari == "km") meter = angka * 1000;
    else if (dari == "mm") meter = angka / 1000;
    else if (dari == "in") meter = angka * 0.0254;
    else if (dari == "ft") meter = angka * 0.3048;
    else if (dari == "yd") meter = angka * 0.9144;
    else if (dari == "mi") meter = angka * 1609.34;

    let hasil = 0;
    // Konversi dari "meter" ke satuan tertentu
    if (ke == "m") hasil = meter;
    else if (ke == "cm") hasil = meter * 100;
    else if (ke == "km") hasil = meter / 1000;
    else if (ke == "mm") hasil = meter * 1000;
    else if (ke == "in") hasil = meter / 0.0254;
    else if (ke == "ft") hasil = meter / 0.3048;
    else if (ke == "yd") hasil = meter / 0.9144;
    else if (ke == "mi") hasil = meter / 1609.34;

    // Tampilkan hasil ke elemen dengan id="hasil"
    let hasilBox = document.getElementById("hasil");
    hasilBox.innerHTML = angka + " " + dari + " = " + hasil + " " + ke;

    // Animasi muncul (fade in)
    hasilBox.style.opacity = "0"; 
    setTimeout(() => {
        hasilBox.style.opacity = "1";
    }, 50);
}
