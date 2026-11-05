import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

@Injectable()
export class DbService implements OnModuleDestroy {
  readonly client: postgres.Sql;
  readonly db: PostgresJsDatabase<typeof schema>;

  constructor(config: ConfigService) {
    this.client = postgres(config.getOrThrow<string>("DATABASE_URL"));
    this.db = drizzle(this.client, { schema });
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
