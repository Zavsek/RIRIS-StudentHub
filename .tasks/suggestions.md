# Predlogi

- Paket `Microsoft.AspNetCore.SignalR.Client` na API-ju ni potreben. Strežniški SignalR je že del ASP.NET Core.
- `CoursePage.tsx` nima preverjanja `hasHydrated` iz `authStore` (kot imajo druge strani), kar ob osvežitvi strani (F5) lahko uporabnika preusmeri na domačo stran pred zaključenim branjem lokalnega stanja.
- Omejitev velikosti datoteke: na frontendu (`MaterialUploadModal.tsx`) je meja 15 MB, medtem ko backend (`MaterialEndpoints.cs`) zavrača datoteke nad 10 MB (`10 * 1024 * 1024`). Meji je smiselno uskladiti.
- V `MaterialHandler.cs` poizvedba `GetMaterialsForCourseAsync` uporablja `INNER JOIN uporabnik u`, kar v primeru manjkajočega ali izbrisanega avtorja izpusti gradivo; varneje je uporabiti `LEFT JOIN`.
- V `useMaterialStore` se gradiva hranijo v enotnem polju `materials: Material[]`, namesto po ID-ju predmeta (npr. `Record<number, Material[]>`), kar lahko povzroči kratkotrajni prikaz gradiv prejšnjega predmeta ob preklopu med predmeti.
- `CoursePage.tsx` trenutno nima klica za pridobitev podatkov o predmetu (naziv, nosilec, smer), temveč ima fiksen napis "Pregled predmeta".
