# Triagebox demo sandbox

Open [`/demo`](/demo), or use **Try it with sample data** on the landing page.
The demo immediately loads five realistic file records: a camera photo, contract,
voice note, archive, and text note. It is a read-only preview, so no real folder
handle is requested and no file can move.

Demo state is stored in IndexedDB record `demo:latest`; real local work uses the
separate `latest` record. Demo mode never reads or writes the real record. The
banner stays visible while demo mode is active. **Reset demo** rebuilds the sample;
**Start for real** returns to `/` and leaves demo state isolated.
