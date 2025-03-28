    //code for the title area
    const sectionTitles = {
      11: "Masti, torņi, konstrukcijas",
      12: "Santehnika",
      13: "Kompresori",
      14: "Pārvadāšana un iekraušana",
      15: "Ģeneratori",
      16: "Mērinstrumenti",
      17: "Mazgāšanas aprīkojums",
      18: "Citi",
      21: "Telefoni",
      22: "Datori",
      23: "Virtuves tehnika",
      24: "Biroja tehnika",
      25: "Baterijas, Akumulatori",
      26: "Apgaismojums, Televizori",
      27: "Foto un optika",
      28: "Dārza tehnika",
      29: "Citi",
      31: "Vieglie auto",
      32: "Velosipēdi, skūteri",
      33: "Kravas automašīnas",
      34: "Traktori",
      35: "Lauksaimniecības mašīnas",
      36: "Piekabes",
      37: "Jumta kastes",
      38: "Ūdens transports",
      39: "Citi",
      41: "Sieviešu apģērbi",
      42: "Vīriešu apģērbi", 
      43: "Sieviešu apavi",
      44: "Vīriešu apavi",
      45: "Aksesuāri", 
      46: "Sieviešu somiņas",
      47: "Mugursomas un Čemodāni",
      48: "Citi",
      51: "Sporta aprīkojums",
      52: "Medības, kempings",
      53: "Mūzikas instrumenti",
      54: "Slidošana",
      55: "Rokdarbi",
      56: "Citi",
      61: "Dekorācijas",
      62: "Dzīvnieki",
      63: "Mēbeles un Paklāji",
      64: "Inventārs aktīvai atpūtai",
      65: "Atrakciju noma",
      66: "Trauki, galda rīki",
      67: "Kostīmi",
      68: "Pirtis",
      69: "Citi",
    };
     //code for the title area
     const mainCategoryTitles = {
        1: "Mašīnas, būvniecība",
        2: "Instrumenti, elektronika",
        3: "Transportlīdzekļi",
        4: "Apģērbi, apavi",
        5: "Hobijs",
        6: "Pasākumi",
      };   

    export const detectSection = (n) => {
        const num = Number(n);

        //get all keys from sectionTitles object
        const keys = Object.keys(sectionTitles);

        for (let i = 0; i < keys.length; i++) {
            if (num === Number(keys[i])) {
                return sectionTitles[keys[i]]
            }
        }
        return "No section";
    }

    export const detectCategory = (n) => {
        const num = Number(n);
        const keys = Object.keys(mainCategoryTitles);
        for (let i = 0; i < keys.length; i++) {
            if(num === Number(keys[i])) {
                return mainCategoryTitles[keys[i]];
            }
        }
        return "No category"
    }
