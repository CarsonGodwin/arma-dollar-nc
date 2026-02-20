-- User-submitted party tags for filers that don't have party info
-- Tags are permanent once set (can only be removed by admin)

CREATE TABLE IF NOT EXISTS party_tags (
  filer_id TEXT PRIMARY KEY,
  party TEXT NOT NULL CHECK (party IN ('REPUBLICAN', 'DEMOCRAT', 'LIBERTARIAN', 'GREEN', 'INDEPENDENT')),
  tagged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE party_tags ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read party tags
CREATE POLICY "Party tags are viewable by everyone"
  ON party_tags FOR SELECT
  USING (true);

-- Allow anyone to insert a party tag (but only once per filer_id due to PK constraint)
CREATE POLICY "Anyone can tag a filer once"
  ON party_tags FOR INSERT
  WITH CHECK (true);

-- No update or delete policies - only admins can modify via Supabase dashboard

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_party_tags_filer_id ON party_tags(filer_id);

-- Pre-populate with known party affiliations for significant COH filers
-- Republicans
INSERT INTO party_tags (filer_id, party) VALUES
  ('00081727', 'REPUBLICAN'),  -- Middleton II, David M.
  ('00070273', 'REPUBLICAN'),  -- Burrows, Dustin R.
  ('00083762', 'REPUBLICAN'),  -- Reitz, Aaron F.
  ('00069001', 'REPUBLICAN'),  -- Buckingham, Dawn C.
  ('00069651', 'REPUBLICAN'),  -- Huffines, Donald B.
  ('00029493', 'REPUBLICAN'),  -- Geren, Charlie
  ('00036483', 'REPUBLICAN'),  -- King, Phillip S.
  ('00067980', 'REPUBLICAN'),  -- Hall III, Robert L.
  ('00020051', 'REPUBLICAN'),  -- Craddick, Tom
  ('00041354', 'REPUBLICAN'),  -- Kolkhorst, Lois W.
  ('00066066', 'REPUBLICAN'),  -- Perry, Charles L.
  ('00069756', 'REPUBLICAN'),  -- Landgraf, Brooks
  ('00085798', 'REPUBLICAN'),  -- Sparks, Kevin D
  ('00067547', 'REPUBLICAN'),  -- Bell Jr., Cecil I.
  ('00084135', 'REPUBLICAN'),  -- Hull, Lacey M.
  ('00067768', 'REPUBLICAN'),  -- DeAyala, Emilio F.
  ('00069367', 'REPUBLICAN'),  -- VanDeaver, Gary W.
  ('00020192', 'REPUBLICAN'),  -- Gohmert, Louis B.
  ('00084044', 'REPUBLICAN'),  -- Thimesch, Kronda
  ('00067539', 'REPUBLICAN'),  -- Fallon, Patrick E.
  ('00019652', 'REPUBLICAN'),  -- Abbott, Greg
  ('00036573', 'REPUBLICAN'),  -- Eltife, Kevin P.
  ('00067922', 'REPUBLICAN'),  -- Little, Pamela M.
  ('00020664', 'REPUBLICAN'),  -- Smithee, John
  ('00051407', 'REPUBLICAN'),  -- Paxton Jr., W. Kenneth
  ('00069565', 'REPUBLICAN'),  -- Murr, Andrew S.
  ('00051286', 'REPUBLICAN'),  -- Hegar Jr., Glenn
  ('00062004', 'REPUBLICAN'),  -- Goldman, Craig
  ('00031204', 'REPUBLICAN'),  -- Branch, Dan
  ('00035962', 'REPUBLICAN'),  -- Nichols, Robert
  ('00020673', 'REPUBLICAN'),  -- Nelson, Jane
  ('00083642', 'REPUBLICAN'),  -- Isaac, Carrie
  ('00051651', 'REPUBLICAN'),  -- Darby, William
  ('00051797', 'REPUBLICAN'),  -- Guillen, Ryan A. (switched from D)
  ('00056964', 'REPUBLICAN'),  -- Landtroop Jr., James F.
  ('00051506', 'REPUBLICAN'),  -- Smith, Richard Wayne
  ('00084941', 'REPUBLICAN'),  -- Hopper, Stephen (Andy)
  ('00088090', 'REPUBLICAN'),  -- Richardson, Keresa
  ('00087854', 'REPUBLICAN'),  -- Villalobos, Denise
  ('00088008', 'REPUBLICAN'),  -- Wharton, Arthur D. (Trey)
  ('00051164', 'REPUBLICAN'),  -- Pena Jr., Aaron (switched from D)
  ('00056322', 'REPUBLICAN'),  -- White, James E.
  ('00087887', 'REPUBLICAN'),  -- Alders, Benjamin D. (Daniel)
  ('00084202', 'REPUBLICAN')   -- Young, Audrey G.
ON CONFLICT (filer_id) DO NOTHING;

-- Democrats
INSERT INTO party_tags (filer_id, party) VALUES
  ('00040542', 'DEMOCRAT'),  -- Martinez Fischer, Trey
  ('00020971', 'DEMOCRAT'),  -- Zaffirini, Judith
  ('00020990', 'DEMOCRAT'),  -- West, Royce
  ('00021186', 'DEMOCRAT'),  -- Raymond, Richard
  ('00069719', 'DEMOCRAT'),  -- Romero Jr., Ramon
  ('00086218', 'DEMOCRAT'),  -- Wilson, Teresa S.
  ('00069541', 'DEMOCRAT'),  -- Blanco, Cesar J.
  ('00084192', 'DEMOCRAT'),  -- Campos, Elizabeth
  ('00067628', 'DEMOCRAT'),  -- Cortez, Philip
  ('00013805', 'DEMOCRAT'),  -- Hinojosa, Juan
  ('00062485', 'DEMOCRAT'),  -- Gutierrez, Rolando
  ('00054543', 'DEMOCRAT'),  -- Martinez, Armando
  ('00067987', 'DEMOCRAT'),  -- Rose, Toni N.
  ('00024376', 'DEMOCRAT'),  -- Alvarado, Carol
  ('00054808', 'DEMOCRAT'),  -- Anchia, Rafael
  ('00057411', 'DEMOCRAT'),  -- Hernandez, Ana E.
  ('00062850', 'DEMOCRAT'),  -- Moody, Joseph E.
  ('00068004', 'DEMOCRAT'),  -- Gonzalez, Mary Edna
  ('00065230', 'DEMOCRAT'),  -- Canales, Terry
  ('00082026', 'DEMOCRAT'),  -- Gonzalez, Jessica A.
  ('00082318', 'DEMOCRAT'),  -- Sherman Sr., Carl
  ('00026313', 'DEMOCRAT'),  -- Farrar, Jessica
  ('00019673', 'DEMOCRAT'),  -- Allen, Alma A.
  ('00082094', 'DEMOCRAT'),  -- Davis, Aicha
  ('00070466', 'DEMOCRAT'),  -- Bernal, Diego M.
  ('00083199', 'DEMOCRAT'),  -- Morales, Christina
  ('00088300', 'DEMOCRAT'),  -- Garcia, Linda J.
  ('00085598', 'DEMOCRAT'),  -- Bhojani, Salman
  ('00083989', 'DEMOCRAT'),  -- Shaw, Penny
  ('00083896', 'DEMOCRAT'),  -- Holguin, Eric
  ('00084031', 'DEMOCRAT'),  -- Castaneda, Chrysta
  ('00026389', 'DEMOCRAT'),  -- Pickett, Joseph
  ('00067897', 'DEMOCRAT'),  -- Dominguez, Alejandro
  ('00020685', 'DEMOCRAT'),  -- Puente, Robert R.
  ('00086182', 'DEMOCRAT'),  -- Jones Jr., Venton C.
  ('00082081', 'DEMOCRAT'),  -- Markowitz, Elizabeth A.
  ('00086104', 'DEMOCRAT'),  -- Wooten, Denise
  ('00084305', 'DEMOCRAT'),  -- Morales Jr., Heriberto
  ('00088467', 'DEMOCRAT'),  -- Ford Sr., Jerry
  ('00082111', 'DEMOCRAT'),  -- White, Robert Andrew
  ('00086453', 'DEMOCRAT')   -- Childs, Staci D.
ON CONFLICT (filer_id) DO NOTHING;
